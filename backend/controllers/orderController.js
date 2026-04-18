const Order   = require("../models/Order");
const { sendOrderConfirmation, sendStatusUpdate } = require("../services/whatsappService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOrderEmail, orderConfirmHTML, shippedEmailHTML } = require("../utils/email");
const { calculateOrderTotals } = require("../services/pricingService");
const { normalizeOrderOutput } = require("../utils/imageUrl");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create  — place order (alias for POST /api/orders)
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, paymentReference, couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ message: "No items in order" });

  const totals = calculateOrderTotals(items, couponCode);
  const normalizedPaymentMethod = String(paymentMethod || "COD").toUpperCase();
  const isUpiOrder = normalizedPaymentMethod === "UPI";
  const normalizedPaymentReference = String(paymentReference || "").trim();

  if (isUpiOrder && !/^[A-Za-z0-9\-_]{8,40}$/.test(normalizedPaymentReference)) {
    return res.status(400).json({
      message: "Valid UPI payment reference is required before placing order.",
    });
  }

  const initialStatus = isUpiOrder ? "Awaiting Payment Verification" : "Placed";

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: normalizedPaymentMethod,
    paymentId: isUpiOrder ? normalizedPaymentReference : "",
    orderStatus: initialStatus,
    couponCode:    totals.couponCode,
    subtotal:      totals.subtotal,
    discount:      totals.discount,
    shippingCharge:totals.shippingCharge,
    total:         totals.total,
  });

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
        total:        order.total,
        items:        order.items || [],
      }).catch(e => console.log("WhatsApp order confirm error:", e.message));
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
    .populate("user", "name email")
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
        total:        order.total,
        items:        order.items || [],
      }).catch(e => console.log("WhatsApp order confirm error:", e.message));
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

  const populated = await Order.findById(order._id).populate("user", "name email");
  res.json(normalizeOrderOutput(populated.toObject()));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my  — user's own orders
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders.map((order) => normalizeOrderOutput(order.toObject())));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  — single order by _id (user or admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
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
      .populate("user", "name email"),
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
