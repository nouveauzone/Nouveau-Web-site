const Order   = require("../models/Order");
const Product = require("../models/Product");
const { sendOrderConfirmation, sendPaymentSuccess, sendStatusUpdate } = require("../services/whatsappService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOrderEmail, orderConfirmHTML, shippedEmailHTML } = require("../utils/email");
const { calculateOrderTotals } = require("../services/pricingService");
const { normalizeOrderOutput } = require("../utils/imageUrl");

const hasSuspiciousUpiPattern = (value) => {
  if (!/^\d{12}$/.test(value)) return true;

  const uniqueDigits = new Set(value.split("")).size;
  if (uniqueDigits <= 2) return true;

  const isSequential = (() => {
    let asc = true;
    let desc = true;
    for (let index = 1; index < value.length; index += 1) {
      const prev = Number(value[index - 1]);
      const curr = Number(value[index]);
      if (curr !== prev + 1) asc = false;
      if (curr !== prev - 1) desc = false;
    }
    return asc || desc;
  })();

  if (isSequential) return true;
  if (/^(\d)\1{11}$/.test(value)) return true;
  if (value === "123456789012" || value === "012345678901" || value === "987654321098") return true;
  return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create  — place order (alias for POST /api/orders)
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, products, shippingAddress, paymentMethod, paymentReference, couponCode } = req.body;
  const orderArray = products || items;
  if (!orderArray?.length) return res.status(400).json({ message: "No items in order" });

  const totals = calculateOrderTotals(orderArray, couponCode);
  const normalizedPaymentMethod = String(paymentMethod || "COD").toUpperCase();
  const isUpiOrder = normalizedPaymentMethod === "UPI";
  const isRazorpayOrder = normalizedPaymentMethod === "RAZORPAY";
  const normalizedPaymentReference = String(paymentReference || "").trim();

  const isValidUpiReference = /^\d{12}$/.test(normalizedPaymentReference);
  const isValidRazorpayReference = /^[A-Za-z0-9\-_]{8,40}$/.test(normalizedPaymentReference);

  if ((isUpiOrder && !isValidUpiReference) || (isRazorpayOrder && !isValidRazorpayReference)) {
    return res.status(400).json({
      message: "Valid payment reference is required before placing order.",
    });
  }

  if (isUpiOrder && hasSuspiciousUpiPattern(normalizedPaymentReference)) {
    return res.status(400).json({
      message: "Please enter the exact 12-digit UTR from your UPI app.",
    });
  }

  if (isUpiOrder) {
    const existingOrder = await Order.findOne({
      paymentMethod: "UPI",
      paymentId: normalizedPaymentReference,
    }).lean();

    if (existingOrder) {
      return res.status(409).json({
        message: "This UTR has already been used. Please verify and enter the correct UTR.",
      });
    }
  }

  const initialStatus = isUpiOrder ? "Awaiting Payment Verification" : "Placed";

  const order = await Order.create({
    userId: req.user._id,
    userEmail: req.user.email,
    products: orderArray,
    shippingAddress,
    paymentMethod: normalizedPaymentMethod,
    paymentStatus: isUpiOrder ? "pending" : "paid",
    paymentId: (isUpiOrder || isRazorpayOrder) ? normalizedPaymentReference : "",
    orderStatus: initialStatus,
    couponCode:    totals.couponCode,
    subtotal:      totals.subtotal,
    discount:      totals.discount,
    shippingCharge:totals.shippingCharge,
    totalAmount:   totals.total,
  });

  // ── Auto Stock Management ──
  for (const item of orderArray) {
    // If the schema ref is populated appropriately, 'item.product' holds the ID
    const productId = item.product || item._id; 
    if (productId) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: -(item.qty || 1) } }).catch(e => console.log("Stock decrement error:", e.message));
    }
  }

  // Confirm only after payment verification for UPI orders.
  if (!isUpiOrder) {
    try {
      await sendOrderEmail({
        to: shippingAddress.email || req.user.email,
        subject: `Order Confirmed #${order.trackingId} — Nouveau™ 🪷`,
        html: orderConfirmHTML(order, req.user),
      });
    } catch (e) { console.log("Order email error:", e.message); }

    const phone = shippingAddress?.phone || req.user?.phone;
    if (phone) {
      sendOrderConfirmation({
        phone,
        customerName: shippingAddress?.name || req.user?.name || "Customer",
        trackingId:   order.trackingId,
        orderId:      order._id,
        total:        order.totalAmount || order.total,
        items:        order.products || order.items || [],
      }).catch(e => console.log("WhatsApp order confirm error:", e.message));

      if (isRazorpayOrder) {
        sendPaymentSuccess({
          phone,
          customerName: shippingAddress?.name || req.user?.name || "Customer",
          trackingId: order.trackingId,
          orderId: order._id,
          paidAmount: order.totalAmount,
          paymentId: normalizedPaymentReference || order.paymentId,
          paymentMethod: "Razorpay",
        }).catch(e => console.log("WhatsApp payment success error:", e.message));
      }
    }
  }

  const trackingUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${order.trackingId}`;
  const userFacingMessage = isUpiOrder
    ? `UPI payment received request. Order will be confirmed after payment verification.\nTracking ID: ${order.trackingId}\nTrack here: ${trackingUrl}`
    : `Your order is confirmed! 🎉\nTracking ID: ${order.trackingId}\nTrack here: ${trackingUrl}`;

  res.status(201).json({
    ...normalizeOrderOutput(order.toObject()),
    whatsappMessage: userFacingMessage,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/track/:trackingId  — public tracking (no auth needed)
// ─────────────────────────────────────────────────────────────────────────────
exports.trackOrder = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;
  const order = await Order.findOne({ trackingId })
    .populate("userId", "name email")
    .lean();

  if (!order) return res.status(404).json({ message: `No order found with tracking ID: ${trackingId}` });

  // Build WhatsApp message
  const trackingURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${order.trackingId}`;
  const isAwaitingPayment = order.orderStatus === "Awaiting Payment Verification";
  order.whatsappMessage = isAwaitingPayment
    ? `UPI payment under verification. Order confirmation will be shared once payment is verified.\nTracking ID: ${order.trackingId}\nTrack here: ${trackingURL}`
    : `Your order is confirmed! 🎉\nTracking ID: ${order.trackingId}\nTrack here: ${trackingURL}`;

  res.json(normalizeOrderOutput(order));
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/update/:id  — admin: update order status + push history
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const VALID = ["Awaiting Payment Verification", "Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

  if (!VALID.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID.join(", ")}` });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isUpiOrder = String(order.paymentMethod || "").toUpperCase() === "UPI";
  const needsPaymentVerification = isUpiOrder && order.paymentStatus !== "paid";

  let statusMessage = message || `Order status updated to ${status}`;
  let paymentJustVerified = false;

  if (needsPaymentVerification && !["Awaiting Payment Verification", "Cancelled"].includes(status)) {
    order.paymentStatus = "paid";
    order.paymentId = order.paymentId || `MANUAL-UPI-${Date.now()}`;
    paymentJustVerified = true;
    statusMessage = message || `UPI payment verified. Order moved to ${status}.`;
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, message: statusMessage });
  await order.save();

  if (paymentJustVerified) {
    try {
      await sendOrderEmail({
        to: order.shippingAddress?.email,
        subject: `Order Confirmed #${order.trackingId} — Nouveau™ 🪷`,
        html: orderConfirmHTML(order, { name: order.shippingAddress?.name || "Customer" }),
      });
    } catch (e) { console.log("Order confirm email error:", e.message); }

    const phone = order.shippingAddress?.phone;
    if (phone) {
      sendOrderConfirmation({
        phone,
        customerName: order.shippingAddress?.name || "Customer",
        trackingId:   order.trackingId,
        orderId:      order._id,
        total:        order.totalAmount,
        items:        order.products || order.items || [],
      }).catch(e => console.log("WhatsApp order confirm error:", e.message));

      sendPaymentSuccess({
        phone,
        customerName: order.shippingAddress?.name || "Customer",
        trackingId: order.trackingId,
        orderId: order._id,
        paidAmount: order.totalAmount,
        paymentId: order.paymentId,
        paymentMethod: "UPI",
      }).catch(e => console.log("WhatsApp payment success error:", e.message));
    }
  }

  // Send shipped email
  if (status === "Shipped") {
    try {
      await sendOrderEmail({
        to: order.shippingAddress?.email,
        subject: `Your Nouveau™ Order #${order.trackingId} is Shipped! 🚚`,
        html: shippedEmailHTML(order),
      });
    } catch (e) { console.log("Shipped email error:", e.message); }
  }

  // Send WhatsApp status update (non-blocking)
  const customerPhone = order.shippingAddress?.phone;
  if (customerPhone) {
    sendStatusUpdate(order, customerPhone)
      .catch(e => console.log("WhatsApp status update error:", e.message));
  }

  const populated = await Order.findById(order._id).populate("userId", "name email");
  res.json(normalizeOrderOutput(populated.toObject()));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my  — user's own orders
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = String(req.user.email || "").toLowerCase();
  const orders = await Order.find({
    $or: [
      { userId },
      ...(userEmail ? [
        { userEmail: userEmail },
        { "shippingAddress.email": userEmail },
      ] : []),
    ],
  }).sort({ createdAt: -1 });
  res.json(orders.map((order) => normalizeOrderOutput(order.toObject())));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  — single order by _id (user or admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("userId", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ message: "Not authorized" });
  res.json(normalizeOrderOutput(order.toObject()));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  — admin: all orders (paginated)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const q = status ? { orderStatus: status } : {};
  const [orders, total] = await Promise.all([
    Order.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * +limit)
      .limit(+limit)
      .populate("userId", "name email"),
    Order.countDocuments(q),
  ]);
  res.json({ orders: orders.map((order) => normalizeOrderOutput(order.toObject())), total });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/orders/:id  — admin
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteOrder = asyncHandler(async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});
