const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createOrder,
  trackOrder,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  getAllOrders,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const router = express.Router();

// ── IMPORTANT: Specific routes BEFORE /:id wildcard ──────────────────────────

// PUBLIC — no auth needed
router.get("/track/:trackingId", trackOrder);

// AUTHENTICATED
const orderCreateValidation = [
  body("items").isArray({ min: 1 }).withMessage("At least one item required"),
  body("items.*.price").isFloat({ gt: 0 }).withMessage("Item price must be positive"),
  body("items.*.qty").isInt({ min: 1 }).withMessage("Item qty must be >= 1"),
  body("paymentMethod").optional().isIn(["COD", "UPI", "cod", "upi"]).withMessage("Unsupported payment method"),
  body("paymentReference")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 8, max: 40 })
    .withMessage("paymentReference must be 8-40 characters"),
  body("shippingAddress.name").trim().notEmpty(),
  body("shippingAddress.phone").trim().notEmpty(),
  body("shippingAddress.email").isEmail(),
  body("shippingAddress.street").trim().notEmpty(),
  body("shippingAddress.city").trim().notEmpty(),
  body("shippingAddress.state").trim().notEmpty(),
  body("shippingAddress.pincode").trim().notEmpty(),
  body().custom((value) => {
    const method = String(value?.paymentMethod || "COD").toUpperCase();
    if (method === "UPI") {
      const ref = String(value?.paymentReference || "").trim();
      if (!/^[A-Za-z0-9\-_]{8,40}$/.test(ref)) {
        throw new Error("Valid UPI paymentReference is required for UPI orders");
      }
    }
    return true;
  }),
  validate,
];

router.post("/", protect, orderCreateValidation, createOrder);
router.post("/create", protect, orderCreateValidation, createOrder);
router.get("/my", protect, getMyOrders);

// ADMIN — specific routes before wildcard
router.get(
  "/all",
  protect, admin,
  [
    query("status").optional().isIn(["Awaiting Payment Verification","Placed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    validate,
  ],
  getAllOrders
);

router.put(
  "/update/:id",
  protect, admin,
  [
    param("id").isMongoId(),
    body("status").isIn(["Awaiting Payment Verification","Placed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"]),
    validate,
  ],
  updateOrderStatus
);

// Legacy status update
router.put(
  "/:id/status",
  protect, admin,
  [
    param("id").isMongoId(),
    body("status").isIn(["Awaiting Payment Verification","Placed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"]),
    validate,
  ],
  updateOrderStatus
);

router.delete("/:id", protect, admin, [param("id").isMongoId(), validate], deleteOrder);

// WILDCARD last — single order by _id
router.get("/:id", protect, [param("id").isMongoId(), validate], getOrderById);

module.exports = router;
