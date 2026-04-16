const express = require("express");
const { body } = require("express-validator");
const Razorpay = require("razorpay");
const Stripe = require("stripe");
const crypto = require("crypto");
const Order = require("../models/Order");
const { sendPaymentSuccess } = require("../services/whatsappService");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");

const payRouter = express.Router();

// POST /api/payments/razorpay/create-order
payRouter.post(
  "/razorpay/create-order",
  protect,
  [body("amount").isFloat({ gt: 0 }).withMessage("amount must be greater than 0"), validate],
  asyncHandler(async (req, res) => {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({ amount: Math.round(req.body.amount * 100), currency: "INR", receipt: `receipt_${Date.now()}` });
    res.json({ orderId: order.id, currency: "INR", amount: order.amount });
  })
);

// POST /api/payments/razorpay/verify
payRouter.post(
  "/razorpay/verify",
  protect,
  [
    body("razorpay_order_id").notEmpty(),
    body("razorpay_payment_id").notEmpty(),
    body("razorpay_signature").notEmpty(),
    body("orderId").isMongoId().withMessage("Valid orderId is required"),
    validate,
  ],
  asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) return res.status(400).json({ message: "Invalid signature" });

  const paidOrder = await Order.findByIdAndUpdate(
    req.body.orderId,
    { paymentStatus: "paid", paymentId: razorpay_payment_id },
    { new: true }
  ).populate("user", "name email");

  // Send WhatsApp payment confirmation (non-blocking)
  const phone = paidOrder?.shippingAddress?.phone;
  if (phone && paidOrder) {
    sendPaymentSuccess({
      phone,
      customerName: paidOrder.shippingAddress?.name || paidOrder.user?.name || "Customer",
      trackingId:   paidOrder.trackingId,
      orderId:      paidOrder._id,
      paidAmount:   paidOrder.total,
      paymentId:    razorpay_payment_id,
    }).catch(e => console.log("WhatsApp payment error:", e.message));
  }

  res.json({ message: "Payment verified" });
})
);

// POST /api/payments/stripe/create-intent
payRouter.post(
  "/stripe/create-intent",
  protect,
  [body("amount").isFloat({ gt: 0 }).withMessage("amount must be greater than 0"), validate],
  asyncHandler(async (req, res) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(req.body.amount * 100),
      currency: "inr",
      metadata: { userId: req.user._id.toString() }
    });
    res.json({ clientSecret: intent.client_secret });
  })
);

module.exports = payRouter;
