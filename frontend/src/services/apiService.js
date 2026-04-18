import API from "../config/api";
import { PRODUCTS as INITIAL_PRODUCTS } from "../data/products";

const normalizeProduct = (product) => ({
	...product,
	images: Array.isArray(product?.images) && product.images.length ? product.images : ["/ethnic1.jpeg"],
	price: Number(product?.price) || 0,
	originalPrice: Number(product?.originalPrice) || Number(product?.price) || 0,
	stock: product?.stock != null ? Number(product.stock) : 10,
	rating: Number(product?.rating) || 0,
	discount: Number(product?.discount) || 0,
});

const normalizeFallback = (value) => {
	const raw = String(value || "").trim();
	if (!raw) return "";
	if (raw === "/api") return "";
	if (raw.startsWith("/")) return "";

	let normalized = raw.replace(/\/+$/, "");

	if (typeof window !== "undefined" && window.location.protocol === "https:" && normalized.startsWith("http://")) {
		normalized = normalized.replace(/^http:\/\//i, "https://");
	}

	return normalized.replace(/\/api$/i, "");
};

const API_FALLBACK = normalizeFallback(process.env.REACT_APP_API_FALLBACK_URL || process.env.VITE_API_FALLBACK_URL);

const buildApiUrl = (base, path) => `${base}/api${path}`;

const isLikelyServerFailure = (status) => status === 502 || status === 503 || status === 504 || status >= 520 || status === 500;

const isSameOriginRequest = (requestUrl) => {
    try {
        const current = typeof window !== "undefined" ? window.location.origin : "";
        if (!current) return false;
        const requested = new URL(requestUrl, current || undefined).origin;
        return requested === current;
    } catch {
        return false;
    }
};

const shouldRetryWithFallback = (requestUrl, res) => {
	if (!API_FALLBACK) return false;
	if (!(res.status === 404 || isLikelyServerFailure(res.status))) return false;

	const current = typeof window !== "undefined" ? window.location.origin : "";
	return Boolean(current) && isSameOriginRequest(requestUrl) && API_FALLBACK !== current;
};

const getAuthHeader = () => {
	try {
		const auth = JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
		return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
	} catch {
		return {};
	}
};

const request = async (path, options = {}) => {
	const primaryUrl = buildApiUrl(API, path);
	let res;

	try {
		res = await fetch(primaryUrl, {
			headers: { "Content-Type": "application/json", ...getAuthHeader(), ...options.headers },
			...options,
		});
	} catch (err) {
		if (API_FALLBACK && isSameOriginRequest(primaryUrl)) {
			res = await fetch(buildApiUrl(API_FALLBACK, path), {
				headers: { "Content-Type": "application/json", ...getAuthHeader(), ...options.headers },
				...options,
			});
		} else {
			throw err;
		}
	}

	if (shouldRetryWithFallback(primaryUrl, res)) {
		res = await fetch(buildApiUrl(API_FALLBACK, path), {
			headers: { "Content-Type": "application/json", ...getAuthHeader(), ...options.headers },
			...options,
		});
	}

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message || "Request failed");
	}

	return res.json();
};

const requestFormData = async (path, formData, options = {}) => {
	const primaryUrl = buildApiUrl(API, path);
	let res;

	try {
		res = await fetch(primaryUrl, {
			method: options.method || "POST",
			headers: { ...getAuthHeader(), ...options.headers },
			body: formData,
		});
	} catch (err) {
		if (API_FALLBACK && isSameOriginRequest(primaryUrl)) {
			res = await fetch(buildApiUrl(API_FALLBACK, path), {
				method: options.method || "POST",
				headers: { ...getAuthHeader(), ...options.headers },
				body: formData,
			});
		} else {
			throw err;
		}
	}

	if (shouldRetryWithFallback(primaryUrl, res)) {
		res = await fetch(buildApiUrl(API_FALLBACK, path), {
			method: options.method || "POST",
			headers: { ...getAuthHeader(), ...options.headers },
			body: formData,
		});
	}

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message || "Request failed");
	}

	return res.json();
};

const apiService = {
	register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
	login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
	getMe: () => request("/auth/me"),

	getProducts: (params = {}) => {
		const q = new URLSearchParams(params).toString();
		return request(`/products${q ? `?${q}` : ""}`, { cache: "no-store" }).catch(() => {
			return INITIAL_PRODUCTS.map(normalizeProduct);
		});
	},
	getProduct: (id) => request(`/products/${id}`),
	createProduct: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
	updateProduct: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
	deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
	addReview: (id, data) => request(`/reviews/${id}`, { method: "POST", body: JSON.stringify(data) }),
	uploadImages: (formData) => requestFormData("/upload", formData),

	placeOrder: (data) => request("/orders", { method: "POST", body: JSON.stringify(data) }),
	getMyOrders: () => request("/orders/my"),
	getOrder: (id) => request(`/orders/${id}`),
	getAllOrders: (params = {}) => {
		const q = new URLSearchParams(params).toString();
		return request(`/orders/all${q ? `?${q}` : ""}`);
	},
	trackOrder: (trackingId) => request(`/orders/track/${trackingId}`),
	updateOrderStatus: (id, status, message) => request(`/orders/update/${id}`, { method: "PUT", body: JSON.stringify({ status, message }) }),
	deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),

	createRazorpayOrder: (amount) => request("/payments/razorpay/create-order", { method: "POST", body: JSON.stringify({ amount }) }),
	verifyRazorpay: (data) => request("/payments/razorpay/verify", { method: "POST", body: JSON.stringify(data) }),

	getAllUsers: (params = {}) => {
		const q = new URLSearchParams(params).toString();
		return request(`/users${q ? `?${q}` : ""}`);
	},
	deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

	updateProfile: (data) => request("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
	addAddress: (data) => request("/users/addresses", { method: "POST", body: JSON.stringify(data) }),
	deleteAddress: (addressId) => request(`/users/addresses/${addressId}`, { method: "DELETE" }),
};

export default apiService;
