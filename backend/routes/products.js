const express = require("express");
const { body, param, query } = require("express-validator");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { normalizeProductInput, normalizeProductOutput } = require("../utils/imageUrl");

const router = express.Router();

const toSafeProduct = (doc) => normalizeProductOutput(doc?.toObject ? doc.toObject() : doc);


// ===============================
// GET ALL PRODUCTS
// ===============================
router.get(
  "/",
  [
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(products.map(toSafeProduct));
  })
);


// ===============================
// GET SINGLE PRODUCT
// ===============================
router.get(
  "/:id",
  [param("id").isMongoId(), validate],
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(toSafeProduct(product));
  })
);


// ===============================
// CREATE PRODUCT (ADMIN)
// ===============================
router.post(
  "/",
  protect,
  admin,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("price").isFloat({ gt: 0 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const product = await Product.create(normalizeProductInput(req.body));
    res.status(201).json(toSafeProduct(product));
  })
);


// ===============================
// UPDATE PRODUCT
// ===============================
router.put(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId(), validate],
  asyncHandler(async (req, res) => {
    const payload = normalizeProductInput(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(toSafeProduct(product));
  })
);


// ===============================
// DELETE PRODUCT
// ===============================
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId(), validate],
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  })
);


module.exports = router;