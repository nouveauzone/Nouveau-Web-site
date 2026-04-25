const mongoose = require("mongoose");
const { normalizeImagePathForStorage } = require("../utils/imageUrl");

const reviewSchema = new mongoose.Schema({
  user:    { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  name:    { type:String, required:true },
  rating:  { type:Number, min:1, max:5, required:true },
  comment: { type:String, required:true },
  date:    { type:Date, default:Date.now },
}, { _id:true });

const sizeStockSchema = new mongoose.Schema({
  size:     { type:String, required:true, trim:true },
  quantity: { type:Number, default:0, min:0 },
}, { _id:false });

const productSchema = new mongoose.Schema({
  title:         { type:String, required:true },
  description:   { type:String, required:true },
  price:         { type:Number, required:true },
  originalPrice: { type:Number, required:true },
  category:      { type:String, required:true, enum:["Indian Ethnic Wear","Indian Western Wear","Indian Premium Western Wear"] },
  subcategory:   { type:String, default:"" },
  gender:        { type:String, enum:["Women","Men","Unisex"], default:"Women" },
  images:        [{ type:String, set: normalizeImagePathForStorage }],
  sizes:         { type:[sizeStockSchema], default:[] },
  stock:         { type:Number, default:0 },
  isNew:         { type:Boolean, default:false },
  isFeatured:    { type:Boolean, default:false },
  discount:      { type:Number, default:0 },
  reviews:       [reviewSchema],
}, { timestamps:true, toJSON:{ virtuals:true } });

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });
productSchema.index({ title: "text", description: "text" });

productSchema.virtual("avgRating").get(function() {
  if (!this.reviews.length) return 0;
  return +(this.reviews.reduce((s,r) => s+r.rating, 0) / this.reviews.length).toFixed(1);
});
productSchema.virtual("numReviews").get(function() {
  return this.reviews.length;
});

productSchema.pre("validate", function(next) {
  if (Array.isArray(this.sizes) && this.sizes.length) {
    this.sizes = this.sizes
      .map((entry) => ({
        size: String(entry?.size || "").trim(),
        quantity: Math.max(0, Number(entry?.quantity) || 0),
      }))
      .filter((entry) => entry.size);

    this.stock = this.sizes.reduce((sum, entry) => sum + entry.quantity, 0);
  } else {
    this.stock = Math.max(0, Number(this.stock) || 0);
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
