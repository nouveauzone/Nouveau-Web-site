import { useReducer, useState, useEffect, createContext } from "react";
import { AuthContext }     from "./AuthContext";
import { CartContext }     from "./CartContext";
import { WishlistContext } from "./WishlistContext";

export const AppDataContext = createContext(null);
export const ToastContext   = createContext(null);

// ── Reducers ──────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":  return { user:action.payload, token:action.token, isAuthenticated:true };
    case "LOGOUT": return { user:null, token:null, isAuthenticated:false };
    case "UPDATE": return { ...state, user:{ ...state.user, ...action.payload } };
    default:       return state;
  }
}
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const ex = state.find(i => i._id===action.item._id && i.size===action.item.size);
      if (ex) return state.map(i => i._id===action.item._id && i.size===action.item.size ? {...i, qty:i.qty+1} : i);
      return [...state, {...action.item, qty:1}];
    }
    case "REMOVE":     return state.filter(i => !(i._id===action.id && i.size===action.size));
    case "UPDATE_QTY": return state.map(i => i._id===action.id && i.size===action.size ? {...i, qty:action.qty} : i);
    case "CLEAR":      return [];
    default:           return state;
  }
}

// ── Safe localStorage helpers ─────────────────────────────────────────────────
const ls = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? def; } catch { return def; } },
  set: (k, v)   => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const hydrateAuthState = () => {
  const raw = ls.get("nouveau_auth", { user:null, token:null, isAuthenticated:false });
  const hasUser = Boolean(raw?.user?._id);
  const hasToken = typeof raw?.token === "string" && raw.token.trim().length > 0;
  if (raw?.isAuthenticated && hasUser && hasToken) return raw;
  return { user:null, token:null, isAuthenticated:false };
};

// ── GLOBAL shared orders store (single source of truth) ──────────────────────
// Both checkout (placeOrder) and admin panel read/write this same array
const loadStoredOrders = () => ls.get("nouveau_all_orders", []);

const normalizeOrder = (order, fallback = {}) => {
  const shippingAddress = order?.shippingAddress || fallback.shippingAddress || {};
  const items = Array.isArray(order?.items) ? order.items : (Array.isArray(fallback.items) ? fallback.items : []);
  const total = order?.total ?? fallback.total ?? order?.price ?? fallback.price ?? 0;

  return {
    ...order,
    _id: order?._id || fallback._id,
    user: order?.user?._id || order?.user || fallback.user || "",
    email: order?.email || shippingAddress.email || fallback.email || "",
    customer: order?.customer || shippingAddress.name || fallback.customer || "",
    phone: order?.phone || shippingAddress.phone || fallback.phone || "",
    product: order?.product || items.map((item) => item.title).join(", ") || fallback.product || "",
    qty: order?.qty ?? items.reduce((sum, item) => sum + Number(item.qty || 0), 0) ?? fallback.qty ?? 0,
    price: total,
    city: order?.city || shippingAddress.city || fallback.city || "",
    state: order?.state || shippingAddress.state || fallback.state || "",
    pincode: order?.pincode || shippingAddress.pincode || fallback.pincode || "",
    address: order?.address || shippingAddress.street || fallback.address || "",
    shippingAddress,
    items,
    status: order?.status || order?.orderStatus || fallback.status || "pending",
    orderStatus: order?.orderStatus || order?.status || fallback.orderStatus || "pending",
    subtotal: order?.subtotal ?? fallback.subtotal ?? 0,
    shippingCharge: order?.shippingCharge ?? fallback.shippingCharge ?? 0,
    total,
    dateRaw: order?.dateRaw || order?.createdAt || fallback.dateRaw || new Date().toISOString(),
    date: order?.date || fallback.date || "",
    steps: order?.steps || fallback.steps || [],
  };
};

export default function Providers({ children }) {
  const [authState, authDispatch] = useReducer(authReducer, hydrateAuthState());
  const [cart,      cartDispatch] = useReducer(cartReducer, ls.get("nouveau_cart", []));
  const [wishlist,  setWishlist]  = useState(() => ls.get("nouveau_wish", []));

  // ── ALL orders — shared between checkout, account, admin, track ────────────
  const [allOrders, setAllOrders] = useState(() => loadStoredOrders());

  // ── Registered users (local — syncs with backend when available) ──────────
  const [localUsers, setLocalUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nouveau_demo_users") || "[]"); } catch { return []; }
  });

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type="success") => {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  // ── Persist ───────────────────────────────────────────────────────────────
  useEffect(() => { ls.set("nouveau_auth",   authState); }, [authState]);
  useEffect(() => { ls.set("nouveau_cart",   cart);      }, [cart]);
  useEffect(() => { ls.set("nouveau_wish",   wishlist);  }, [wishlist]);
  useEffect(() => { ls.set("nouveau_all_orders", allOrders); }, [allOrders]);

  // ── On login: try to load orders from backend, merge with local ───────────
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) return;
    (async () => {
      try {
        const API = (await import("../config/api")).default;
        const data = await API.getMyOrders();
        if (Array.isArray(data) && data.length > 0) {
          // merge: backend orders take priority, keep local-only ones
          setAllOrders(prev => {
            const normalized = data.map((order) => normalizeOrder(order));
            const backendIds = new Set(normalized.map(o => o._id));
            const localOnly  = prev.filter(o => !backendIds.has(o._id));
            return [...normalized, ...localOnly];
          });
        }
      } catch { /* backend not connected — keep local orders */ }
    })();
  }, [authState.isAuthenticated, authState.token]);

  const toggleWishlist = (product) =>
    setWishlist(prev => prev.find(p => p._id===product._id) ? prev.filter(p => p._id!==product._id) : [...prev, product]);

  // ── placeOrder — saves to backend AND local state ─────────────────────────
  const placeOrder = async (address, items, paymentMethod) => {
    const subtotal       = items.reduce((s,i) => s + i.price*i.qty, 0);
    const shippingCharge = subtotal >= 2999 ? 0 : 199;
    const total          = subtotal + shippingCharge;
    const now            = new Date();
    const fmt = (d) => d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});

    // Build tracking steps
    const proc    = new Date(now.getTime() + 86400000);
    const shipped = new Date(proc.getTime() + 86400000*2);
    const ofd     = new Date(shipped.getTime() + 86400000*3);
    const deliv   = new Date(ofd.getTime() + 86400000);

    const steps = [
      { label:"Order Placed",     done:true,  date:fmt(now)    },
      { label:"Processing",       done:false, date:fmt(proc)   },
      { label:"Shipped",          done:false, date:"Expected "+fmt(shipped) },
      { label:"Out for Delivery", done:false, date:"Expected "+fmt(ofd)    },
      { label:"Delivered",        done:false, date:""          },
    ];

    let orderId = "NVU" + Date.now().toString().slice(-8);

    // Try backend first
    try {
      const API = (await import("../config/api")).default;
      const orderData = {
        items: items.map(i => ({ product:i._id, title:i.title, image:i.images?.[0]||"", price:i.price, size:i.size, qty:i.qty })),
        shippingAddress: address,
        paymentMethod: paymentMethod || "COD",
        subtotal, shippingCharge, total,
      };
      const backendOrder = await API.placeOrder(orderData);
      orderId = backendOrder._id;
      if (backendOrder.trackingId) {
        localStorage.setItem("lastTrackingId", backendOrder.trackingId);
      }

      // Save backend order to local state too
      const enriched = normalizeOrder(backendOrder, {
        // extra fields for display
        user:        authState.user?._id || backendOrder.user || "",
        email:       address.email,
        customer:    address.name,
        phone:       address.phone,
        city:        address.city,
        state:       address.state,
        pincode:     address.pincode,
        address:     address.street,
        shippingAddress: address,
        dateRaw:     now,
        date:        fmt(now),
        status:      backendOrder.orderStatus || "Placed",
        orderStatus: backendOrder.orderStatus || "Placed",
        trackingId:  backendOrder.trackingId || "",
        statusHistory: backendOrder.statusHistory || [],
        estimatedDelivery: backendOrder.estimatedDelivery || "",
        steps,
        items:       orderData.items,
        subtotal,
        shippingCharge,
        total,
      });
      setAllOrders(prev => [enriched, ...prev]);
    } catch {
      // Backend not available — save locally so admin can still see it
      const localOrder = normalizeOrder({
        _id:         orderId,
        user:        authState.user?._id || "",
        customer:    address.name,
        email:       address.email,
        phone:       address.phone,
        product:     items.map(i=>i.title).join(", "),
        qty:         items.reduce((s,i)=>s+i.qty,0),
        price:       total,
        size:        items[0]?.size || "M",
        paymentMethod: paymentMethod || "COD",
        city:        address.city   || "",
        state:       address.state  || "",
        pincode:     address.pincode|| "",
        address:     address.street || "",
        shippingAddress: address,
        items:       items.map(i => ({ title:i.title, image:i.images?.[0]||"", price:i.price, size:i.size, qty:i.qty })),
        status:      "pending",
        orderStatus: "pending",
        subtotal,
        shippingCharge,
        total,
        dateRaw:     now,
        date:        fmt(now),
        createdAt:   now.toISOString(),
        steps,
      });
      setAllOrders(prev => [localOrder, ...prev]);
    }

    localStorage.setItem("lastOrderId", orderId);
    return orderId;
  };

  // ── Admin actions — update/delete in shared state ─────────────────────────
  const updateOrderStatus = (orderId, newStatus) => {
    setAllOrders(prev => prev.map(o => {
      if (o._id !== orderId) return o;
      const doneUpTo = { pending:0, processing:1, shipped:2, delivered:4, cancelled:-1 }[newStatus] ?? 0;
      const steps = (o.steps||[]).map((s,i) => ({ ...s, done: newStatus==="cancelled" ? false : i <= doneUpTo }));
      return { ...o, status:newStatus, orderStatus:newStatus, steps };
    }));
  };

  const deleteOrderLocal = (orderId) => setAllOrders(prev => prev.filter(o => o._id !== orderId));

  // ── My orders = orders belonging to current user ──────────────────────────
  const myOrders = allOrders.filter(o => {
    if (!authState.user) return false;
    // match by user id or by email
    return (
      o.user === authState.user._id ||
      o.user?._id === authState.user._id ||
      o.customer === authState.user.name ||
      o.email === authState.user.email ||
      o.shippingAddress?.email === authState.user.email
    );
  });

  const refreshMyOrders = async () => {
    try {
      const API = (await import("../config/api")).default;
      const data = await API.getMyOrders();
      if (Array.isArray(data)) {
        setAllOrders(prev => {
          const normalized = data.map((order) => normalizeOrder(order));
          const backendIds = new Set(normalized.map(o => o._id));
          const localOnly  = prev.filter(o => !backendIds.has(o._id));
          return [...normalized, ...localOnly];
        });
      }
    } catch {}
  };

  const appData = {
    allOrders,
    myOrders,
    refreshMyOrders,
    placeOrder,
    updateOrderStatus,
    deleteOrderLocal,
    localUsers,
  };

  return (
    <AuthContext.Provider value={{ ...authState, dispatch:authDispatch }}>
      <CartContext.Provider value={{ cart, dispatch:cartDispatch }}>
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
          <AppDataContext.Provider value={appData}>
            <ToastContext.Provider value={toast}>
              {children}
              {/* Toast UI */}
              <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)", zIndex:9999, display:"flex", flexDirection:"column", gap:"10px", alignItems:"center", pointerEvents:"none" }}>
                {toasts.map(t => (
                  <div key={t.id} style={{ background:t.type==="error"?"#7a1420":t.type==="warning"?"#6b4800":"#FFFFFF", color:"#fff", padding:"13px 28px", fontSize:"13px", letterSpacing:"1px", fontFamily:"'Poppins',sans-serif", fontWeight:600, borderRadius:"99px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)", borderLeft:`4px solid ${t.type==="error"?"#ff6b6b":t.type==="warning"?"#f9ca24":"#D4AF37"}`, whiteSpace:"nowrap", animation:"fadeUp 0.3s ease" }}>
                    {t.type==="success"?"✦ ":t.type==="error"?"✕ ":"⚠ "}{t.msg}
                  </div>
                ))}
              </div>
            </ToastContext.Provider>
          </AppDataContext.Provider>
        </WishlistContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}
