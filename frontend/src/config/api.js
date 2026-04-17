const normalizeApiBase = (value) => {
	const raw = String(value || "").trim();
	if (!raw) return "";

	// Allow proxy mode by setting REACT_APP_API_URL=/api.
	if (raw === "/api") return "";

	let normalized = raw.replace(/\/+$/, "");

	// Avoid mixed-content when app is served over HTTPS.
	if (typeof window !== "undefined" && window.location.protocol === "https:" && normalized.startsWith("http://")) {
		normalized = normalized.replace(/^http:\/\//i, "https://");
	}

	return normalized.replace(/\/api$/i, "");
};

const API = normalizeApiBase(process.env.REACT_APP_API_URL);

export default API;
