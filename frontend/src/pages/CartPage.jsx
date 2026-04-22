import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";
import { resolveImageUrl } from "../utils/imageUrl";
import { getShippingCharge, SHIPPING_FREE_THRESHOLD } from "../data/constants";

const GOLD = "#C9A227";
const CRIMSON = "#B71C1C";

export default function CartPage({ setPage }) {
  const { cart, dispatch } = useContext(CartContext);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = getShippingCharge(subtotal);
  const total = subtotal + shipping;


  if (!cart.length) {
    return (
      <div style={{ background: THEME.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", padding: "60px 20px" }}>
          <span style={{ fontSize: "64px" }}>🛍️</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px" }}>Your cart is empty</h2>
          <p style={{ color: THEME.textMuted, fontSize: "16px" }}>Looks like you haven't added anything yet.</p>
          <BtnPrimary onClick={() => setPage("Shop")} style={{ borderRadius: "12px", marginTop: "10px" }}>Browse Collections →</BtnPrimary>
        </div>
        <Footer setPage={setPage} />
      </div>
    );
  }

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 40px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", marginBottom: "40px" }}>Shopping Bag</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "60px" }} className="cart-grid-mobile">
          
          {/* ITEMS */}
          <div>
            {cart.map((item) => (
              <div key={`${item._id}-${item.size}`} style={{ display: "flex", gap: "20px", padding: "24px 0", borderBottom: `1px solid ${THEME.border}` }}>
                <div style={{ width: "100px", height: "130px", borderRadius: "8px", overflow: "hidden", background: THEME.bgDark, flexShrink: 0 }}>
                  <img src={resolveImageUrl(item.images?.[0], "/ethnic1.jpeg")} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 600 }}>{item.title}</p>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700, color: GOLD }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                  </div>
                  
                  <p style={{ fontSize: "13px", color: THEME.textMuted, marginBottom: "12px" }}>Size: {item.size}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: "8px", padding: "4px" }}>
                      <button 
                        style={{ background: "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: "18px" }}
                        onClick={() => item.qty > 1 ? dispatch({ type: "UPDATE_QTY", id: item._id, size: item.size, qty: item.qty - 1 }) : dispatch({ type: "REMOVE", id: item._id, size: item.size })}
                      >-</button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontWeight: 600 }}>{item.qty}</span>
                      <button 
                        style={{ background: "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: "18px" }}
                        onClick={() => dispatch({ type: "UPDATE_QTY", id: item._id, size: item.size, qty: item.qty + 1 })}
                      >+</button>
                    </div>

                    <button 
                      onClick={() => dispatch({ type: "REMOVE", id: item._id, size: item.size })}
                      style={{ background: "none", border: "none", color: CRIMSON, fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: "30px" }}>
              <button 
                onClick={() => dispatch({ type: "CLEAR" })}
                style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer", fontSize: "14px" }}
              >Clear Shopping Bag</button>
            </div>
          </div>

          {/* SUMMARY */}
          <div>
            <div style={{ padding: "30px", background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", position: "sticky", top: "100px" }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Order Summary</h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: THEME.textMuted }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: THEME.textMuted }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? "#2ecc71" : THEME.text }}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>

              {shipping > 0 && (
                <p style={{ fontSize: "12px", color: THEME.textMuted, marginBottom: "20px", fontStyle: "italic" }}>
                  Add ₹{(SHIPPING_FREE_THRESHOLD - subtotal).toLocaleString("en-IN")} more for free shipping
                </p>
              )}

              {shipping === 0 && (
                <div style={{ background: "#2ecc7110", color: "#2ecc71", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "20px", display: "flex", gap: "8px" }}>
                  <span>🎉</span> Free shipping applied!
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0", paddingTop: "20px", borderTop: `1px solid ${THEME.border}` }}>
                <span style={{ fontWeight: 700, fontSize: "18px" }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: "22px", color: GOLD }}>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <BtnPrimary onClick={() => setPage("Checkout")} style={{ width: "100%", justifyContent: "center", borderRadius: "12px", padding: "16px" }}>
                Proceed to Checkout →
              </BtnPrimary>

              <div style={{ marginTop: "24px", display: "grid", gap: "10px" }}>
                <p style={{ fontSize: "11px", color: THEME.textMuted, display: "flex", gap: "8px" }}><span>🛡️</span> Secure and encrypted checkout</p>
                <p style={{ fontSize: "11px", color: THEME.textMuted, display: "flex", gap: "8px" }}><span>🚛</span> Estimated delivery in 3-5 days</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}