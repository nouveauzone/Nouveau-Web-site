const express = require("express");
const { body } = require("express-validator");
const Stripe = require("stripe");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");
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
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay is not configured on the server." });
    }

    const amount = Math.round(Number(req.body.amount) * 100);
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const { data: order } = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { userId: req.user._id.toString() },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
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
    body("orderId").optional().isMongoId().withMessage("Valid orderId is required"),
    validate,
  ],
  asyncHandler(async (req, res) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay is not configured on the server." });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "paid";
        order.paymentId = razorpay_payment_id;
        if (String(order.paymentMethod || "").toUpperCase() === "RAZORPAY") {
          order.orderStatus = "Placed";
        }
        await order.save();
      }
    }

    res.json({
      message: "Payment verified",
      razorpay_order_id,
      razorpay_payment_id,
    });
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
