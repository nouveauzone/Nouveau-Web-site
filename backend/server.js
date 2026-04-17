const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");
const path     = require("path");
const helmet   = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const { validateEnv } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/error");
const { bootstrapAdminUser } = require("./utils/bootstrap");
dotenv.config();
validateEnv();

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  ...(process.env.CLIENT_URLS || "").split(","),
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
]
  .map((origin) => String(origin || "").trim())
  .filter(Boolean);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests and server-to-server calls.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(helmet({
  // Frontend runs on a different origin (localhost:3000) in dev.
  // Allow static resources like product images to be embedded cross-origin.
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(compression());
app.use(mongoSanitize());
app.use(hpp());
// Global rate limit — 1000 requests per 15 mins (generous for dev + prod)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1", // skip localhost
  message: { message: "Too many requests, please try again after 15 minutes." },
}));

// Stricter limit only for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again after 15 minutes." },
});
app.use(express.json({ limit:"10mb" }));
// Twilio webhook needs urlencoded body
app.use("/api/whatsapp/webhook", express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended:true, limit:"10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── DB ──────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/nouveau")
  .then(async () => {
    console.log("✅ MongoDB connected");
    await bootstrapAdminUser();
  })
  .catch(err => console.error("❌ MongoDB error:", err.message));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",     authLimiter, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/users",    require("./routes/users"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/upload",   require("./routes/upload"));
app.use("/api/reviews",  require("./routes/reviews"));
app.use("/api/email",    require("./routes/email"));
app.use("/api/health",   require("./routes/health"));
app.use("/api/whatsapp", require("./routes/whatsapp"));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message:"Nouveau™ API v2 running 🪷", status:"ok" }));

// ── Error handler ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Nouveau™ Server → http://localhost:${PORT}`));
