const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const products = [
  {
    title: "Premium Indo-Western Set — Black",
    price: 3300,
    originalPrice: 3300,
    category: "Indian Premium Western Wear",
    subcategory: "Co-Ord Set",
    gender: "Women",
    images: ["/product1.jpeg"],
    sizes: ["L", "XL"],
    rating: 0,
    reviews: 0,
    stock: 10,
    description: "Elegant Embroidery with classy finish, perfect for party & Festive season. Made with premium Korean material. A stunning black Indo-Western set that blends traditional embroidery with modern silhouette.",
    isNew: true,
    discount: 0,
    isFeatured: true,
  },
  {
    title: "Premium Indo-Western Set — White",
    price: 3300,
    originalPrice: 3300,
    category: "Indian Premium Western Wear",
    subcategory: "Co-Ord Set",
    gender: "Women",
    images: ["/product2.jpeg"],
    sizes: ["L", "XL"],
    rating: 0,
    reviews: 0,
    stock: 10,
    description: "Elegant embroidery with classy finish, perfect for festive & party season. Made with premium Korean material. A beautiful white Indo-Western set that radiates grace and elegance.",
    isNew: true,
    discount: 0,
    isFeatured: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/nouveau");
  const Product = require("../models/Product");
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log("✅ 2 products seeded!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });