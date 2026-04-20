const express = require("express");
const { body } = require("express-validator");
const Stripe = require("stripe");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");

const payRouter = express.Router();

// POST /api/payments/razorpay/create-order
payRouter.post(
  "/razorpay/create-order",
  protect,
  [body("amount").optional().isFloat({ gt: 0 }).withMessage("amount must be greater than 0"), validate],
  asyncHandler(async (req, res) => {
    res.status(410).json({
      message: "Razorpay is disabled. Please use COD or UPI/QR payment.",
    });
  })
);

// POST /api/payments/razorpay/verify
payRouter.post(
  "/razorpay/verify",
  protect,
  [
    body("razorpay_order_id").optional().notEmpty(),
    body("razorpay_payment_id").optional().notEmpty(),
    body("razorpay_signature").optional().notEmpty(),
    body("orderId").optional().isMongoId().withMessage("Valid orderId is required"),
    validate,
  ],
  asyncHandler(async (req, res) => {
    res.status(410).json({
      message: "Razorpay is disabled. Please use COD or UPI/QR payment.",
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
