const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
    return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
  } catch { return {}; }
};

const request = async (path, options = {}) => {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader(), ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Request failed");
    }
    return res.json();
  } catch (err) {
    throw err;
  }
};

const requestFormData = async (path, formData, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || "POST",
    headers: { ...getAuthHeader(), ...options.headers },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
};

export const API = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data) => request("/auth/login",    { method: "POST", body: JSON.stringify(data) }),
  getMe:    ()     => request("/auth/me"),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products${q ? "?" + q : ""}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  addReview:  (id, data) => request(`/reviews/${id}`, { method: "POST", body: JSON.stringify(data) }),

  uploadImages: (formData) => requestFormData("/upload", formData),

  // Orders
  placeOrder:   (data) => request("/orders", { method: "POST", body: JSON.stringify(data) }),
  getMyOrders:  ()     => request("/orders/my"),
  getOrder:     (id)   => request(`/orders/${id}`),
  getAllOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/orders${q ? "?" + q : ""}`);
  },
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),

  // Payments
  createRazorpayOrder: (amount) => request("/payments/razorpay/create-order", { method: "POST", body: JSON.stringify({ amount }) }),
  verifyRazorpay:      (data)   => request("/payments/razorpay/verify",       { method: "POST", body: JSON.stringify(data) }),

  // Users
  getAllUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/users${q ? "?" + q : ""}`);
  },
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
};

export default API;
