// ════════════════════════════════════════════════════════════
// models/User.js
// ════════════════════════════════════════════════════════════
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ["user","admin"], default: "user" },
  addresses: [{
    street: String, city: String, state: String, pincode: String, isDefault: Boolean
  }],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);

// ════════════════════════════════════════════════════════════
// models/Product.js
// ════════════════════════════════════════════════════════════
const productSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  category:    { type: String, required: true, enum: ["Kurta","Co-Ord","Anarkali","Saree","Lehenga","Palazzo","Suit","Jacket","Other"] },
  gender:      { type: String, enum: ["Women","Men","Unisex"], default: "Women" },
  images:      [{ type: String }],
  sizes:       [{ type: String }],
  stock:       { type: Number, default: 0 },
  isNew:       { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  discount:    { type: Number, default: 0 },
  ratings: [{
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating:  { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date:    { type: Date, default: Date.now }
  }],
}, { timestamps: true, toJSON: { virtuals: true } });

productSchema.virtual("avgRating").get(function() {
  if (!this.ratings.length) return 0;
  return (this.ratings.reduce((s, r) => s + r.rating, 0) / this.ratings.length).toFixed(1);
});

module.exports = mongoose.model("Product", productSchema);

// ════════════════════════════════════════════════════════════
// models/Order.js
// ════════════════════════════════════════════════════════════
const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title:    String,
    image:    String,
    price:    Number,
    size:     String,
    qty:      Number,
  }],
  shippingAddress: {
    name: String, phone: String, email: String,
    street: String, city: String, state: String, pincode: String,
  },
  paymentMethod:  { type: String, enum: ["razorpay","stripe","cod"] },
  paymentStatus:  { type: String, enum: ["pending","paid","failed"], default: "pending" },
  paymentId:      String,
  orderStatus:    { type: String, enum: ["pending","processing","shipped","delivered","cancelled"], default: "pending" },
  subtotal:       Number,
  discount:       { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  total:          Number,
  couponCode:     String,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
