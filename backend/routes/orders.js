const express = require("express");
const { body, param, query } = require("express-validator");
const Order   = require("../models/Order");
const { protect, admin } = require("../middleware/auth");
const { sendOrderEmail, orderConfirmHTML, shippedEmailHTML } = require("../utils/email");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { calculateOrderTotals } = require("../services/pricingService");
const router  = express.Router();

// POST /api/orders — place order
router.post(
  "/",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.title").optional().isString(),
    body("items.*.price").isFloat({ gt: 0 }).withMessage("Item price must be positive"),
    body("items.*.qty").isInt({ min: 1 }).withMessage("Item qty must be at least 1"),
    body("shippingAddress.name").trim().notEmpty(),
    body("shippingAddress.phone").trim().notEmpty(),
    body("shippingAddress.email").isEmail().withMessage("Valid shipping email required"),
    body("shippingAddress.street").trim().notEmpty(),
    body("shippingAddress.city").trim().notEmpty(),
    body("shippingAddress.state").trim().notEmpty(),
    body("shippingAddress.pincode").trim().notEmpty(),
    body("paymentMethod").optional().isString().isLength({ min: 2, max: 40 }),
    body("couponCode").optional().isString().isLength({ max: 20 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    if (!items?.length) return res.status(400).json({ message:"No items" });
    const totals = calculateOrderTotals(items, couponCode);
    const order = await Order.create({
      user: req.user._id, items, shippingAddress,
      paymentMethod: paymentMethod||"COD",
      couponCode: totals.couponCode,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingCharge: totals.shippingCharge,
      total: totals.total,
    });
    // Send confirmation email
    try {
      await sendOrderEmail({
        to: shippingAddress.email || req.user.email,
        subject: `Order Confirmed #${order._id} — Nouveau™ 🪷`,
        html: orderConfirmHTML(order, req.user),
      });
    } catch(e) { console.log("Order email error:", e.message); }
    res.status(201).json(order);
  })
);

// GET /api/orders/my — user's own orders
router.get("/my", protect, asyncHandler(async (req, res) => {
    const orders = await Order.find({ user:req.user._id }).sort({ createdAt:-1 });
    res.json(orders);
}));

// GET /api/orders/:id — single order
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid order id"), validate],
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user","name email");
    if (!order) return res.status(404).json({ message:"Order not found" });
    if (order.user._id.toString()!==req.user._id.toString() && req.user.role!=="admin")
      return res.status(403).json({ message:"Not authorized" });
    res.json(order);
  })
);

// GET /api/orders — admin: all orders
router.get(
  "/",
  protect,
  admin,
  [
    query("status").optional().isIn(["pending","processing","shipped","delivered","cancelled"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { status, page=1, limit=50 } = req.query;
    const q = status ? { orderStatus:status } : {};
    const [orders, total] = await Promise.all([
      Order.find(q).sort({ createdAt:-1 }).skip((page-1)*+limit).limit(+limit).populate("user","name email"),
      Order.countDocuments(q),
    ]);
    res.json({ orders, total });
  })
);

// PUT /api/orders/:id/status — admin update
router.put(
  "/:id/status",
  protect,
  admin,
  [
    param("id").isMongoId().withMessage("Invalid order id"),
    body("status").isIn(["pending","processing","shipped","delivered","cancelled"]),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.status },
      { new:true }
    ).populate("user","name email");
    if (!order) return res.status(404).json({ message:"Not found" });
    // Send shipped email
    if (req.body.status === "shipped") {
      try {
        await sendOrderEmail({
          to: order.shippingAddress?.email || order.user?.email,
          subject: `Your Nouveau™ Order #${order._id} is Shipped! 🚚`,
          html: shippedEmailHTML(order),
        });
      } catch(e) { console.log("Shipped email error:", e.message); }
    }
    res.json(order);
  })
);

// DELETE /api/orders/:id — admin
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid order id"), validate],
  asyncHandler(async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message:"Deleted" });
  })
);

module.exports = router;
