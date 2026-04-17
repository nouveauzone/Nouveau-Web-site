const normalizeApiBase = (value) => {
	const raw = String(value || "").trim();
	if (!raw) return "";

	// Allow proxy mode by setting REACT_APP_API_URL=/api.
	if (raw === "/api") return "";
	if (raw.startsWith("/")) return "";

	let normalized = raw.replace(/\/+$/, "");

	if (typeof window !== "undefined") {
		try {
			const configured = new URL(normalized);
			const currentHost = window.location.host;

			// If a stale CloudFront domain is baked into the bundle, prefer same-origin /api.
			if (configured.hostname.endsWith("cloudfront.net") && configured.host !== currentHost) {
				return "";
			}
		} catch {
			return "";
		}
	}

	// Avoid mixed-content when app is served over HTTPS.
	if (typeof window !== "undefined" && window.location.protocol === "https:" && normalized.startsWith("http://")) {
		normalized = normalized.replace(/^http:\/\//i, "https://");
	}

	return normalized.replace(/\/api$/i, "");
};

const API = normalizeApiBase(process.env.REACT_APP_API_URL || process.env.VITE_API_URL);

export default API;
