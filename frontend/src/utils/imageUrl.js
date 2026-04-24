const deriveBaseUrl = () => {
  const configured = String(process.env.REACT_APP_BASE_URL || process.env.VITE_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  const fromApi = String(process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");

  return fromApi;
};

const BASE_URL = deriveBaseUrl();
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;
const HOST_WITHOUT_PROTOCOL_RE = /^(localhost|127\.0\.0\.1)(:\d+)?\//i;
const FILE_NAME_RE = /^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|gif|svg)$/i;

const CATALOG_IMAGE_RE = /^(ethnic\d+|western\d+|product\d+|nouveau-logo|payment-qr)\.(png|jpe?g|webp|gif|svg)$/i;

const toFileName = (pathValue = "") => String(pathValue).split("/").filter(Boolean).pop() || "";

const toUploadsAbsoluteUrl = (pathValue = "") => {
  const fileName = toFileName(pathValue);
  if (!fileName) return "";
  if (!BASE_URL) return `/uploads/${fileName}`;
  return `${BASE_URL}/uploads/${fileName}`;
};

const normalizeUploadsPath = (pathValue = "", fallback = "/ethnic1.jpeg") => {
  const fileName = toFileName(pathValue);
  if (!fileName) return fallback;

  if (CATALOG_IMAGE_RE.test(fileName)) {
    return `/${fileName}`;
  }

  return toUploadsAbsoluteUrl(pathValue);
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
  let value = src.trim().replace(/\\/g, "/");
  if (!value) return fallback;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  // Handle values like "localhost:5000/uploads/file.jpg" that are missing protocol.
  if (HOST_WITHOUT_PROTOCOL_RE.test(value)) {
    value = `http://${value}`;
  }

  if (value.startsWith("/uploads/")) return normalizeUploadsPath(value, fallback);
  if (value.startsWith("uploads/")) return normalizeUploadsPath(`/${value}`, fallback);

  // Handle bare filenames from DB values, e.g. "abc123.jpg".
  if (FILE_NAME_RE.test(value)) {
    return normalizeUploadsPath(`/uploads/${value}`, fallback);
  }

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

      if (LOCALHOST_RE.test(value)) {
        if (pathName.startsWith("/uploads/")) {
          return normalizeUploadsPath(pathName, fallback);
        }

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
  if (value.startsWith("/")) return value;
  return fallback;
}
