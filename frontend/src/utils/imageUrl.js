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

export function getImageUrl(src, fallback = "/ethnic1.jpeg") {
  if (!src || typeof src !== "string") return fallback;
  let value = src.trim().replace(/\\/g, "/");
  if (!value) return fallback;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  // Handle values missing protocol such as host/uploads/file.jpg.
  if (HOST_WITHOUT_PROTOCOL_RE.test(value)) {
    value = `http://${value}`;
  }

  // Extremely vigorous forced protection against mixed-content and backend leaking localhost URLs
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (/localhost|127\.0\.0\.1/i.test(value)) {
      const fileName = toFileName(value);
      if (fileName) {
        if (CATALOG_IMAGE_RE.test(fileName)) return `/${fileName}`;
        // If BASE_URL is accidentally compiled as localhost, fallback to window.location.origin
        let safeBase = /localhost|127\.0\.0\.1/i.test(BASE_URL) ? window.location.origin : (BASE_URL || "https://nouveauz.com");
        return `${safeBase}/uploads/${fileName}`;
      }
    }
  }

  if (value.startsWith("http://localhost:5000") || value.startsWith("https://localhost:5000")) {
    if (BASE_URL) {
      value = value.replace(/^https?:\/\/localhost:5000/i, BASE_URL);
    }
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
        // Double check not to return localhost when on HTTPS
        let finalPath = normalizeUploadsPath(pathName, fallback);
        if (typeof window !== "undefined" && window.location.protocol === "https:" && /localhost|127\.0\.0\.1/i.test(finalPath)) {
            const fName = toFileName(pathName);
            return `${window.location.origin}/uploads/${fName}`;
        }
        return finalPath;
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

export const resolveImageUrl = getImageUrl;
