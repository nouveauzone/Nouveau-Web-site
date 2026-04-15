const express = require("express");
const { body, param, query } = require("express-validator");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const router  = express.Router();

// GET /api/products
router.get(
  "/",
  [
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("sort").optional().isIn(["price-asc", "price-desc", "newest", "rating"]),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, search, sort, page=1, limit=20 } = req.query;
    const q = { gender:"Women" }; // women only
    if (category && category!=="All") q.category = category;
    if (minPrice||maxPrice) q.price = { ...(minPrice&&{$gte:+minPrice}), ...(maxPrice&&{$lte:+maxPrice}) };
    if (search) q.$or = [{ title:{$regex:search,$options:"i"} }, { description:{$regex:search,$options:"i"} }];
    const sortMap = { "price-asc":{price:1}, "price-desc":{price:-1}, "newest":{createdAt:-1}, "rating":{avgRating:-1} };
    const sortOpt = sortMap[sort] || { isFeatured:-1, createdAt:-1 };
    const [products, total] = await Promise.all([
      Product.find(q).sort(sortOpt).skip((page-1)*+limit).limit(+limit),
      Product.countDocuments(q),
    ]);
    res.json({ products, total, pages:Math.ceil(total/+limit) });
  })
);

// GET /api/products/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid product id"), validate],
  asyncHandler(async (req, res) => {
    const p = await Product.findById(req.params.id).populate("reviews.user","name avatar");
    if (!p) return res.status(404).json({ message:"Not found" });
    res.json(p);
  })
);

// POST /api/products — admin
router.post(
  "/",
  protect,
  admin,
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("price").isFloat({ gt: 0 }),
    body("originalPrice").isFloat({ gt: 0 }),
    body("category").isIn(["Indian Ethnic Wear", "Indian Premium Western Wear"]),
    body("stock").optional().isInt({ min: 0 }),
    body("sizes").optional().isArray(),
    body("images").optional().isArray(),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const p = await Product.create({ ...req.body, gender:"Women" });
    res.status(201).json(p);
  })
);

// PUT /api/products/:id — admin
router.put(
  "/:id",
  protect,
  admin,
  [
    param("id").isMongoId().withMessage("Invalid product id"),
    body("title").optional().trim().notEmpty(),
    body("price").optional().isFloat({ gt: 0 }),
    body("originalPrice").optional().isFloat({ gt: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!p) return res.status(404).json({ message:"Not found" });
    res.json(p);
  })
);

// DELETE /api/products/:id — admin
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid product id"), validate],
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message:"Deleted" });
  })
);

// POST /api/products/:id/reviews — add review (logged in user)
router.post(
  "/:id/reviews",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid product id"),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").trim().notEmpty().isLength({ min: 3, max: 2000 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ message:"Rating and comment required" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message:"Product not found" });
    const already = product.reviews.find(r => r.user.toString()===req.user._id.toString());
    if (already) return res.status(400).json({ message:"You have already reviewed this product" });
    product.reviews.push({ user:req.user._id, name:req.user.name, rating:+rating, comment });
    await product.save();
    res.status(201).json({ message:"Review added", reviews:product.reviews, avgRating:product.avgRating });
  })
);

// DELETE /api/products/:id/reviews/:reviewId — admin or own
router.delete(
  "/:id/reviews/:reviewId",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid product id"),
    param("reviewId").isMongoId().withMessage("Invalid review id"),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message:"Product not found" });
    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message:"Review not found" });
    if (review.user.toString()!==req.user._id.toString() && req.user.role!=="admin")
      return res.status(403).json({ message:"Not authorized" });
    product.reviews.pull(req.params.reviewId);
    await product.save();
    res.json({ message:"Review deleted" });
  })
);

module.exports = router;
