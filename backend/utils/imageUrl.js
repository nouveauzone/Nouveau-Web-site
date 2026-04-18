const { getPublicBaseUrl } = require("../config/env");

const HTTP_RE = /^https?:\/\//i;
const LOCAL_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

const forceHttps = (url) => url.replace(/^http:\/\//i, "https://");

const normalizeImagePathForStorage = (src) => {
  const raw = String(src || "").trim();
  if (!raw) return "";

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  if (HTTP_RE.test(raw)) {
    // Keep non-local external URLs (Cloudinary/S3), but enforce HTTPS.
    if (!LOCAL_HOST_RE.test(raw)) return forceHttps(raw);

    try {
      const parsed = new URL(raw);
      return normalizeImagePathForStorage(parsed.pathname);
    } catch {
      return "";
    }
  }

  if (raw.startsWith("/uploads/")) return raw.slice(1);
  if (raw.startsWith("uploads/")) return raw;
  if (raw.startsWith("/")) return `uploads/${raw.slice(1)}`;

  // Bare filename from old seed/admin data.
  if (!raw.includes("/")) return `uploads/${raw}`;

  return raw;
};

const toPublicImageUrl = (src) => {
  const raw = String(src || "").trim();
  if (!raw) return "";

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  if (HTTP_RE.test(raw) && !LOCAL_HOST_RE.test(raw)) {
    return forceHttps(raw);
  }

  const baseUrl = getPublicBaseUrl();
  const stored = normalizeImagePathForStorage(raw);
  if (!stored) return "";

  if (HTTP_RE.test(stored)) return forceHttps(stored);
  if (stored.startsWith("uploads/")) return `/${stored}`;
  if (stored.startsWith("/uploads/")) return stored;
  if (stored.startsWith("/")) return `/uploads/${stored.slice(1)}`;
  return `${baseUrl}/${stored}`;
};

const normalizeImageListForStorage = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((src) => normalizeImagePathForStorage(src))
    .filter(Boolean);
};

const normalizeProductInput = (payload = {}) => {
  if (!payload || typeof payload !== "object") return payload;
  if (!Array.isArray(payload.images)) return payload;

  return {
    ...payload,
    images: normalizeImageListForStorage(payload.images),
  };
};

const normalizeProductOutput = (product = {}) => {
  if (!product || typeof product !== "object") return product;

  const images = Array.isArray(product.images)
    ? product.images.map((src) => toPublicImageUrl(src)).filter(Boolean)
    : [];

  return {
    ...product,
    images,
  };
};

const normalizeOrderOutput = (order = {}) => {
  if (!order || typeof order !== "object") return order;

  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        ...item,
        image: toPublicImageUrl(item?.image || ""),
      }))
    : [];

  return {
    ...order,
    items,
  };
};

module.exports = {
  normalizeImagePathForStorage,
  normalizeImageListForStorage,
  normalizeProductInput,
  normalizeProductOutput,
  normalizeOrderOutput,
  toPublicImageUrl,
};
