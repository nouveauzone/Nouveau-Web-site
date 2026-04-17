import API from "../config/api";

const API_FALLBACK = String(process.env.REACT_APP_API_FALLBACK_URL || "https://api.nouveauz.com")
	.trim()
	.replace(/\/+$/, "");

const buildApiUrl = (base, path) => `${base}/api${path}`;

const shouldRetryWithFallback = (requestUrl, res) => {
	if (res.status !== 404 || !API_FALLBACK) return false;

	try {
		const current = typeof window !== "undefined" ? window.location.origin : "";
		const requested = new URL(requestUrl, current || undefined).origin;
		return Boolean(current) && requested === current && API_FALLBACK !== current;
	} catch {
		return false;
	}
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
	let res = await fetch(primaryUrl, {
		headers: { "Content-Type": "application/json", ...getAuthHeader(), ...options.headers },
		...options,
	});

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
	let res = await fetch(primaryUrl, {
		method: options.method || "POST",
		headers: { ...getAuthHeader(), ...options.headers },
		body: formData,
	});

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
		return request(`/products${q ? `?${q}` : ""}`);
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
