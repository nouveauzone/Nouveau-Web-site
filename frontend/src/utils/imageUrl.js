import API from "../config/api";

const API_ROOT = (API || "").replace(/\/api\/?$/, "");
const BASE_URL = "https://nouveauz.com";
const DEFAULT_API_ORIGIN = "https://api.nouveauz.com";
const UPLOADS_ORIGIN = API_ROOT || DEFAULT_API_ORIGIN;
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

const CATALOG_IMAGE_RE = /^(ethnic\d+|western\d+|product\d+|nouveau-logo|payment-qr)\.(png|jpe?g|webp|gif|svg)$/i;

const toFileName = (pathValue = "") => String(pathValue).split("/").filter(Boolean).pop() || "";

const toUploadsUrl = (pathValue = "") => {
  const normalized = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  return `${UPLOADS_ORIGIN}${normalized}`;
};

const normalizeUploadsPath = (pathValue = "", fallback = "/ethnic1.jpeg") => {
  const fileName = toFileName(pathValue);
  if (!fileName) return fallback;

  if (CATALOG_IMAGE_RE.test(fileName)) {
    return `/${fileName}`;
  }

  return toUploadsUrl(pathValue);
};

const toLocalImagePath = (urlValue) => {
  try {
    const parsed = new URL(urlValue, typeof window !== "undefined" ? window.location.origin : BASE_URL);
    const fileName = (parsed.pathname || "").split("/").filter(Boolean).pop();
    if (!fileName) return "";

    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(fileName)) {
      return `/${fileName}`;
    }

    return "";
  } catch {
    return "";
  }
};

const toHttps = (url) => url.replace(/^http:\/\//i, "https://");

export function resolveImageUrl(src, fallback = "/ethnic1.jpeg") {
  if (!src || typeof src !== "string") return fallback;
  const value = src.trim();
  if (!value) return fallback;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  if (value.startsWith("/uploads/")) return normalizeUploadsPath(value, fallback);
  if (value.startsWith("uploads/")) return normalizeUploadsPath(`/${value}`, fallback);

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      const currentHost = typeof window !== "undefined" ? window.location.host : "";
      const pathName = parsed.pathname || "";

      if (currentHost && parsed.host === currentHost) {
        const sameHostPath = pathName;
        if (sameHostPath.startsWith("/uploads/")) {
          return normalizeUploadsPath(sameHostPath, fallback);
        }
        return sameHostPath || fallback;
      }

      if (pathName.startsWith("/uploads/")) {
        return normalizeUploadsPath(pathName, fallback);
      }

      const localPath = toLocalImagePath(value);
      if (localPath) return localPath;

      if (LOCALHOST_RE.test(value) && API_ROOT) {
        const path = parsed.pathname || "";
        return `${BASE_URL}${path}`;
      }

      if (typeof window !== "undefined" && window.location.protocol === "https:" && value.startsWith("http://")) {
        return toHttps(value);
      }

      return fallback;
    } catch {
      return fallback;
    }
  }
  return value;
}
