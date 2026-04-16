// ════════════════════════════════════════════════════════════
// middleware/auth.js
// ════════════════════════════════════════════════════════════
const jwt = require("jsonwebtoken");
const User = require("../models/models");

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch { res.status(401).json({ message: "Token invalid" }); }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

module.exports = { protect, adminOnly };

// ════════════════════════════════════════════════════════════
// routes/auth.js
// ════════════════════════════════════════════════════════════
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });
    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json(req.user));

module.exports = router;

// ════════════════════════════════════════════════════════════
// routes/products.js
// ════════════════════════════════════════════════════════════
const productRouter = express.Router();

// GET /api/products  (with filters & pagination)
productRouter.get("/", async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, search, sort, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category && category !== "All") query.category = category;
    if (gender && gender !== "All") query.gender = gender;
    if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];

    const sortMap = { "price-asc": { price: 1 }, "price-desc": { price: -1 }, "rating": { avgRating: -1 }, "newest": { createdAt: -1 } };
    const sortOpt = sortMap[sort] || { isFeatured: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOpt).skip((page-1)*limit).limit(+limit);
    res.json({ products, total, pages: Math.ceil(total/limit), page: +page });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/:id
productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST /api/products  (admin)
productRouter.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/products/:id  (admin)
productRouter.put("/:id", protect, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

// DELETE /api/products/:id  (admin)
productRouter.delete("/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

// POST /api/products/:id/review
productRouter.post("/:id/review", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    const alreadyReviewed = product.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed" });
    product.ratings.push({ user: req.user._id, rating: req.body.rating, comment: req.body.comment });
    await product.save();
    res.json({ message: "Review added" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = productRouter;

// ════════════════════════════════════════════════════════════
// routes/orders.js
// ════════════════════════════════════════════════════════════
const orderRouter = express.Router();

// POST /api/orders
orderRouter.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, discount, shippingCharge, total, couponCode } = req.body;
    const order = await Order.create({ user: req.user._id, items, shippingAddress, paymentMethod, subtotal, discount, shippingCharge, total, couponCode });
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/orders/my
orderRouter.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.product", "title images");
  res.json(orders);
});

// GET /api/orders  (admin)
orderRouter.get("/", protect, adminOnly, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { orderStatus: status } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit).populate("user", "name email");
  const total = await Order.countDocuments(query);
  res.json({ orders, total });
});

// PUT /api/orders/:id/status  (admin)
orderRouter.put("/:id/status", protect, adminOnly, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});

module.exports = orderRouter;

// ════════════════════════════════════════════════════════════
// routes/payments.js
// ════════════════════════════════════════════════════════════
const payRouter = express.Router();
const Razorpay = require("razorpay");
const Stripe   = require("stripe");
const crypto   = require("crypto");

// POST /api/payments/razorpay/create-order
payRouter.post("/razorpay/create-order", protect, async (req, res) => {
  try {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({ amount: req.body.amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` });
    res.json({ orderId: order.id, currency: "INR", amount: order.amount });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/payments/razorpay/verify
payRouter.post("/razorpay/verify", protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ message: "Invalid signature" });
  await Order.findByIdAndUpdate(req.body.orderId, { paymentStatus: "paid", paymentId: razorpay_payment_id });
  res.json({ message: "Payment verified" });
});

// POST /api/payments/stripe/create-intent
payRouter.post("/stripe/create-intent", protect, async (req, res) => {
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({ amount: req.body.amount * 100, currency: "inr", metadata: { userId: req.user._id.toString() } });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = payRouter;

// ════════════════════════════════════════════════════════════
// routes/users.js
// ════════════════════════════════════════════════════════════
const userRouter = express.Router();

// GET /api/users  (admin)
userRouter.get("/", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// PUT /api/users/profile
userRouter.put("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Not found" });
  user.name = req.body.name || user.name;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email });
});

// POST /api/users/wishlist
userRouter.post("/wishlist", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.body.productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(req.body.productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

module.exports = userRouter;

// ════════════════════════════════════════════════════════════
// routes/upload.js
// ════════════════════════════════════════════════════════════
const uploadRouter = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({ cloud_name: process.env.CLOUDINARY_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

const storage = new CloudinaryStorage({ cloudinary, params: { folder: "nouveau", allowed_formats: ["jpg","jpeg","png","webp"] } });
const upload = multer({ storage });

// POST /api/upload
uploadRouter.post("/", protect, adminOnly, upload.array("images", 5), (req, res) => {
  const urls = req.files.map(f => f.path);
  res.json({ urls });
});

module.exports = uploadRouter;
