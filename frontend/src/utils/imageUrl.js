const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export function resolveImageUrl(src, fallback = "/ethnic1.jpeg") {
  if (!src || typeof src !== "string") return fallback;
  const value = src.trim();
  if (!value) return fallback;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/uploads/")) return `${API_ROOT}${value}`;
  if (value.startsWith("uploads/")) return `${API_ROOT}/${value}`;
  return value;
}
