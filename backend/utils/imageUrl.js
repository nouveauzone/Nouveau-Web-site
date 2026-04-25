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
  if (!raw) return "/product1.jpeg";

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  if (HTTP_RE.test(raw) && !LOCAL_HOST_RE.test(raw)) {
    return forceHttps(raw);
  }

  const baseUrl = getPublicBaseUrl();
  const stored = normalizeImagePathForStorage(raw);
  if (!stored) return "";

  if (HTTP_RE.test(stored)) return forceHttps(stored);
  if (stored.startsWith("uploads/")) return `${baseUrl}/${stored}`;
  if (stored.startsWith("/uploads/")) return `${baseUrl}${stored}`;
  if (stored.startsWith("/")) return `${baseUrl}/uploads/${stored.slice(1)}`;
  return `${baseUrl}/${stored}`;
};

const normalizeImageListForStorage = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((src) => normalizeImagePathForStorage(src))
    .filter(Boolean);
};

const normalizeSizeInventory = (sizes, stock = 0) => {
  const fallbackStock = Math.max(0, Number(stock) || 0);

  if (!Array.isArray(sizes) || sizes.length === 0) {
    return [];
  }

  const normalized = sizes
    .map((entry) => {
      if (typeof entry === "string") {
        const size = entry.trim();
        if (!size) return null;
        return { size, quantity: fallbackStock };
      }

      const size = String(entry?.size || "").trim();
      if (!size) return null;
      return {
        size,
        quantity: Math.max(0, Number(entry?.quantity) || 0),
      };
    })
    .filter(Boolean);

  return normalized;
};

const normalizeProductInput = (payload = {}) => {
  if (!payload || typeof payload !== "object") return payload;

  const normalizedSizes = normalizeSizeInventory(payload.sizes, payload.stock);
  const derivedStock = normalizedSizes.length
    ? normalizedSizes.reduce((sum, entry) => sum + entry.quantity, 0)
    : Math.max(0, Number(payload.stock) || 0);

  return {
    ...payload,
    images: Array.isArray(payload.images)
      ? normalizeImageListForStorage(payload.images)
      : payload.images,
    sizes: normalizedSizes.length || Array.isArray(payload.sizes)
      ? normalizedSizes
      : payload.sizes,
    stock: derivedStock,
  };
};

const normalizeProductOutput = (product = {}) => {
  if (!product || typeof product !== "object") return product;

  const normalizedSizes = normalizeSizeInventory(product.sizes, product.stock);
  const derivedStock = normalizedSizes.length
    ? normalizedSizes.reduce((sum, entry) => sum + entry.quantity, 0)
    : Math.max(0, Number(product.stock) || 0);

  const images = Array.isArray(product.images)
    ? product.images.map((src) => toPublicImageUrl(src)).filter(Boolean)
    : [];

  return {
    ...product,
    images,
    sizes: normalizedSizes.length || Array.isArray(product.sizes)
      ? normalizedSizes
      : product.sizes,
    stock: derivedStock,
  };
};

const normalizeOrderOutput = (order = {}) => {
  if (!order || typeof order !== "object") return order;

  const rawItems = order.products || order.items || [];
  const normalizedItems = Array.isArray(rawItems)
    ? rawItems.map((item) => ({
        ...item,
        image: toPublicImageUrl(item?.image || ""),
      }))
    : [];

  return {
    ...order,
    // Provide both new and old properties for seamless backwards compatibility
    products: normalizedItems,
    items: normalizedItems,
    userId: order.userId || order.user?._id || order.user,
    user: order.userId || order.user,
    totalAmount: order.totalAmount !== undefined ? order.totalAmount : order.total,
    total: order.totalAmount !== undefined ? order.totalAmount : order.total,
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
