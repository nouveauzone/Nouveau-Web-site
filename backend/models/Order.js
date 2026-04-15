const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type:mongoose.Schema.Types.ObjectId, ref:"Product" },
  title:    String,
  image:    String,
  price:    Number,
  size:     String,
  qty:      Number,
});

const orderSchema = new mongoose.Schema({
  user:            { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  items:           [orderItemSchema],
  shippingAddress: {
    name:String, phone:String, email:String,
    street:String, city:String, state:String, pincode:String,
  },
  paymentMethod:  { type:String, default:"COD" },
  paymentStatus:  { type:String, enum:["pending","paid","failed"], default:"pending" },
  paymentId:      { type:String, default:"" },
  orderStatus:    { type:String, enum:["pending","processing","shipped","delivered","cancelled"], default:"pending" },
  subtotal:       { type:Number, default:0 },
  discount:       { type:Number, default:0 },
  shippingCharge: { type:Number, default:0 },
  total:          { type:Number, default:0 },
  couponCode:     { type:String, default:"" },
  emailSent:      { type:Boolean, default:false },
}, { timestamps:true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
