const express    = require("express");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { protect, admin } = require("../middleware/auth");
const path = require("path");
const fs   = require("fs");
const router = express.Router();

// ── If Cloudinary is configured, use it; else save locally ──────────────────
const useCloudinary = process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_NAME !== "your_cloud_name";

let upload;
if (useCloudinary) {
  cloudinary.config({
    cloud_name:  process.env.CLOUDINARY_NAME,
    api_key:     process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET,
  });
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder:"nouveau", allowed_formats:["jpg","jpeg","png","webp"], transformation:[{ width:800, crop:"limit" }] },
  });
  upload = multer({ storage, limits:{ fileSize:5*1024*1024 } });
} else {
  // Local storage fallback
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive:true });
  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now()+"-"+file.originalname.replace(/\s/g,"_")),
  });
  upload = multer({ storage, limits:{ fileSize:5*1024*1024 } });
}

// Serve local uploads
const router2 = express.Router();

// POST /api/upload — upload images (admin only)
router.post("/", protect, admin, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message:"No files uploaded" });
    const urls = req.files.map(f => useCloudinary ? f.path : `/uploads/${f.filename}`);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const normalized = urls.map((url) => {
      if (typeof url !== "string") return url;
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      if (url.startsWith("/uploads/")) return `${baseUrl}${url}`;
      return url;
    });
    res.json({ urls: normalized, message:"Upload successful" });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

module.exports = router;
