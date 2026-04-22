import axios from "axios";
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
  if (!raw || raw === "/api" || raw.startsWith("/")) return "";

  let normalized = raw.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.protocol === "https:" && normalized.startsWith("http://")) {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }

  return normalized.replace(/\/api$/i, "");
};

const API_FALLBACK = normalizeFallback(process.env.REACT_APP_API_FALLBACK_URL || process.env.VITE_API_FALLBACK_URL);
const AUTH_EXPIRED_EVENT = "nouveau:auth-expired";

const buildApiBase = (base) => {
  const normalized = String(base || "").replace(/\/+$/, "");
  return normalized ? `${normalized}/api` : "/api";
};

const isLikelyServerFailure = (status) => status === 404 || status === 500 || status === 502 || status === 503 || status === 504 || status >= 520;

const isSameOriginBase = (baseURL) => {
  if (!baseURL) return true;
  if (baseURL.startsWith("/")) return true;

  try {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    if (!currentOrigin) return false;
    return new URL(baseURL, currentOrigin).origin === currentOrigin;
  } catch {
    return false;
  }
};

const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
  } catch {
    return {};
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem("nouveau_auth");
  } catch {}
};

const emitAuthExpired = (message = "Session expired. Please login again.") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { message } }));
};

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 20000,
    withCredentials: false,
  });

  client.interceptors.request.use((config) => {
    const token = getStoredAuth()?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const primaryClient = createClient(buildApiBase(API));
const fallbackClient = API_FALLBACK ? createClient(buildApiBase(API_FALLBACK)) : null;

const requestWithClient = async (client, config) => {
  const response = await client.request(config);
  return response.data;
};

const shouldRetryWithFallback = (error, client) => {
  if (!fallbackClient) return false;
  if (!error?.response) return false;
  if (client !== primaryClient) return false;
  if (!isLikelyServerFailure(Number(error.response.status))) return false;
  return isSameOriginBase(primaryClient.defaults.baseURL || "");
};

const request = async (config) => {
  try {
    return await requestWithClient(primaryClient, config);
  } catch (error) {
    if (shouldRetryWithFallback(error, primaryClient)) {
      return requestWithClient(fallbackClient, config);
    }

    const status = Number(error?.response?.status || 0);
    const message = error?.response?.data?.message || error?.message || "Request failed";

    if (status === 401) {
      clearStoredAuth();
      emitAuthExpired(message || "Token invalid or expired");
    }

    throw new Error(message);
  }
};

const apiService = {
  register: (data) => request({ url: "/auth/register", method: "POST", data }),
  login: (data) => request({ url: "/auth/login", method: "POST", data }),
  getMe: () => request({ url: "/auth/me", method: "GET" }),

  getProducts: (params = {}) => {
    return request({ url: "/products", method: "GET", params }).catch(() => INITIAL_PRODUCTS.map(normalizeProduct));
  },
  getProduct: (id) => request({ url: `/products/${id}`, method: "GET" }),
  createProduct: (data) => request({ url: "/products", method: "POST", data }),
  updateProduct: (id, data) => request({ url: `/products/${id}`, method: "PUT", data }),
  deleteProduct: (id) => request({ url: `/products/${id}`, method: "DELETE" }),
  addReview: (id, data) => request({ url: `/reviews/${id}`, method: "POST", data }),
  uploadImages: (formData) => request({ url: "/upload", method: "POST", data: formData }),
  createRazorpayOrder: (data) => request({ url: "/payments/razorpay/create-order", method: "POST", data }),
  verifyRazorpayPayment: (data) => request({ url: "/payments/razorpay/verify", method: "POST", data }),

  placeOrder: (data) => request({ url: "/orders", method: "POST", data }),
  getMyOrders: () => request({ url: "/orders/my", method: "GET" }),
  getOrder: (id) => request({ url: `/orders/${id}`, method: "GET" }),
  getAllOrders: (params = {}) => request({ url: "/orders/all", method: "GET", params }),
  trackOrder: (trackingId) => request({ url: `/orders/track/${trackingId}`, method: "GET" }),
  updateOrderStatus: (id, status, message) => request({ url: `/orders/update/${id}`, method: "PUT", data: { status, message } }),
  deleteOrder: (id) => request({ url: `/orders/${id}`, method: "DELETE" }),

  getAllUsers: (params = {}) => request({ url: "/users", method: "GET", params }),
  deleteUser: (id) => request({ url: `/users/${id}`, method: "DELETE" }),

  updateProfile: (data) => request({ url: "/auth/profile", method: "PUT", data }),
  addAddress: (data) => request({ url: "/auth/addresses", method: "POST", data }),
  deleteAddress: (addressId) => request({ url: `/auth/addresses/${addressId}`, method: "DELETE" }),

  getMonthlyViews: (month) => request({ url: "/metrics/views", method: "GET", params: month ? { month } : {} }),
  incrementMonthlyViews: (month) => request({ url: "/metrics/views", method: "POST", data: month ? { month } : {} }),
};

export { AUTH_EXPIRED_EVENT };
export default apiService;
