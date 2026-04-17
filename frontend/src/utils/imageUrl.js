import API from "../config/api";

const API_ROOT = (API || "").replace(/\/api\/?$/, "");
const PUBLIC_IMAGE_ORIGIN = "https://nouveauz.com";
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

const toHttps = (url) => url.replace(/^http:\/\//i, "https://");

export function resolveImageUrl(src, fallback = "/ethnic1.jpeg") {
  if (!src || typeof src !== "string") return fallback;
  const value = src.trim();
  if (!value) return fallback;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    if (LOCALHOST_RE.test(value) && API_ROOT) {
      try {
        const path = new URL(value).pathname || "";
        return `${PUBLIC_IMAGE_ORIGIN}${path}`;
      } catch {
        return fallback;
      }
    }

    if (typeof window !== "undefined" && window.location.protocol === "https:" && value.startsWith("http://")) {
      return toHttps(value);
    }

    return value;
  }
  if (value.startsWith("/uploads/")) return `${PUBLIC_IMAGE_ORIGIN}${value}`;
  if (value.startsWith("uploads/")) return `${PUBLIC_IMAGE_ORIGIN}/${value}`;
  return value;
}
