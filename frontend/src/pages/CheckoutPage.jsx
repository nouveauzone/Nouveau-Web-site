import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { AppDataContext } from "../context/Providers";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import { resolveImageUrl } from "../utils/imageUrl";
import { getShippingCharge } from "../data/constants";
import DirectUPIPayment from "../components/DirectUPIPayment";
import CardPayment from "../components/CardPayment";
import { BUSINESS_UPI_ID } from "../config/payment";

const GOLD = "#C9A227";
const CRIMSON = "#B71C1C";
const ADDRESS_FIELDS = [
  { key: "name", label: "Full Name", type: "text" },
  { key: "phone", label: "Phone Number (WhatsApp updates)", type: "tel" },
  { key: "email", label: "Email Address", type: "email", fullRow: true },
  { key: "street", label: "Street Address", type: "text", fullRow: true },
  { key: "city", label: "City", type: "text" },
  { key: "state", label: "State", type: "text" },
  { key: "pincode", label: "Pincode", type: "text" },
];

export default function CheckoutPage({ setPage }) {
  const { cart, dispatch: cartDispatch } = useContext(CartContext);
  const { placeOrder } = useContext(AppDataContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", email: "", street: "", city: "", state: "", pincode: "" });
  const [payMethod, setPayMethod] = useState("COD");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [upiPaymentRef] = useState(`NVZ-${Date.now()}`);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  const shipping = getShippingCharge(subtotal);
  const total = subtotal + cgst + sgst + shipping;

  const validate = () => {
    const nextErrors = {};
    if (!address.name.trim()) nextErrors.name = "Required";
    if (!address.phone.trim()) nextErrors.phone = "Required";
    if (!address.email.trim()) nextErrors.email = "Required";
    if (!address.street.trim()) nextErrors.street = "Required";
    if (!address.city.trim()) nextErrors.city = "Required";
    if (!address.state.trim()) nextErrors.state = "Required";
    if (!address.pincode.trim()) nextErrors.pincode = "Required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("nouveau_post_auth_page", "Checkout");
      setPage("Auth");
      return;
    }

    setProcessing(true);
    try {
      const orderId = await placeOrder(address, cart, "COD", "");
      cartDispatch({ type: "CLEAR" });
      localStorage.setItem("lastOrderId", orderId);
      setPage("OrderSuccess");
    } catch (error) {
      console.error("Order failed:", error);
      alert("Order placement failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpiSuccess = async ({ reference }) => {
    if (!isAuthenticated) return;

    const normalizedReference = String(reference || '').replace(/\D/g, '');
    if (!/^\d{12}$/.test(normalizedReference)) {
      alert("Order cannot be created without a valid 12-digit UPI UTR/Reference number.");
      return;
    }

    setProcessing(true);
    try {
      const orderId = await placeOrder(address, cart, "UPI", normalizedReference);
      cartDispatch({ type: "CLEAR" });
      localStorage.setItem("lastOrderId", orderId);
      setPage("OrderSuccess");
    } catch (error) {
      console.error("UPI order failed:", error);
      alert("Payment was completed but order creation failed. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCardSuccess = async ({ paymentId }) => {
    if (!isAuthenticated) return;

    setProcessing(true);
    try {
      const orderId = await placeOrder(address, cart, "RAZORPAY", paymentId || `NVZ-${Date.now()}`);
      cartDispatch({ type: "CLEAR" });
      localStorage.setItem("lastOrderId", orderId);
      setPage("OrderSuccess");
    } catch (error) {
      console.error("Card order failed:", error);
      alert("Payment was completed but order creation failed. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <div style={{ background: THEME.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ maxWidth: "520px", width: "100%", background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "18px", padding: "34px 30px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, fontWeight: 700, marginBottom: "10px" }}>SECURE CHECKOUT</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "10px", color: THEME.text }}>Login Required</h2>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted, lineHeight: 1.7, marginBottom: "24px" }}>
            Please login first to place your order.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <BtnOutline onClick={() => setPage("Home")} color={THEME.textMuted} style={{ borderRadius: "12px" }}>← Back to Store</BtnOutline>
            <BtnPrimary onClick={() => { localStorage.setItem("nouveau_post_auth_page", "Checkout"); setPage("Auth"); }} style={{ borderRadius: "12px" }}>Login to Continue</BtnPrimary>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px clamp(16px, 4vw, 40px)" }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "42px", marginBottom: "8px", color: THEME.text }}>Checkout</h1>
        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, marginBottom: "40px" }}>Secure checkout — powered by Nouveau™</p>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "48px", flexWrap: "wrap", gap: "8px" }}>
          {["Address", "Payment", "Review"].map((label, index) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: step > index + 1 ? "pointer" : "default" }} onClick={() => step > index + 1 && setStep(index + 1)}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: step > index + 1 ? `linear-gradient(135deg,${CRIMSON},${GOLD})` : step === index + 1 ? GOLD : THEME.bgCard, border: step === index + 1 ? "none" : `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: step >= index + 1 ? "#fff" : THEME.textLight, transition: "all 0.3s", fontFamily: "'Poppins',sans-serif" }}>
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <span style={{ fontSize: "10px", letterSpacing: "2px", color: step >= index + 1 ? THEME.text : THEME.textLight, fontFamily: "'Poppins',sans-serif", fontWeight: step >= index + 1 ? 600 : 400, textTransform: "uppercase" }}>{label}</span>
              </div>
              {index < 2 && <div style={{ width: "48px", height: "1.5px", background: step > index + 1 ? GOLD : THEME.border, margin: "0 12px", transition: "all 0.3s" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? "24px" : "40px" }} className="cart-sidebar">
          <div>
            {step === 1 && (
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "24px", fontWeight: 700 }}>DELIVERY ADDRESS</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                    columnGap: "20px",
                    rowGap: "16px",
                  }}
                  className="checkout-address-grid"
                >
                  {ADDRESS_FIELDS.map(({ key, label, type, fullRow }) => (
                    <div key={key} style={{ gridColumn: fullRow ? "1 / -1" : "auto", width: "100%", minWidth: 0 }}>
                      <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: errors[key] ? CRIMSON : THEME.textMuted, display: "block", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                        {label}{errors[key] && <span style={{ color: CRIMSON, marginLeft: "6px" }}>*</span>}
                      </label>
                      <input
                        type={type}
                        value={address[key]}
                        onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
                        className="checkout-input"
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: THEME.bgCard,
                          border: `1px solid ${errors[key] ? CRIMSON : THEME.border}`,
                          borderRadius: "10px",
                          color: THEME.text,
                          fontFamily: "'Poppins',sans-serif",
                          fontSize: "14px",
                          transition: "all 0.2s",
                        }}
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ background: "#25D36610", border: "1px solid #25D36640", borderRadius: "10px", padding: "12px 16px", marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>💬</span>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: "#128C7E" }}>
                    <strong>WhatsApp updates</strong> — Order confirmation & tracking sent to your phone!
                  </p>
                </div>

                <div style={{ marginTop: "32px" }}>
                  <BtnPrimary onClick={() => { if (validate()) setStep(2); }} style={{ borderRadius: "12px", padding: "15px 40px" }}>
                    Continue to Payment →
                  </BtnPrimary>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "24px", fontWeight: 700 }}>PAYMENT METHOD</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
                  {[
                    ["COD", "💵", "Cash on Delivery", "Pay when your order arrives — safe & simple"],
                    ["UPI", "📲", "UPI Intent", "PhonePe, Google Pay, Paytm, or BHIM app opens directly"],
                    ["CARD", "💳", "Credit / Debit Card", "Visa, Mastercard, RuPay — secure card payment"],
                  ].map(([value, icon, title, description]) => (
                    <div
                      key={value}
                      onClick={() => setPayMethod(value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "20px 24px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        border: `2px solid ${payMethod === value ? GOLD : THEME.border}`,
                        background: payMethod === value ? `rgba(201,162,39,0.08)` : THEME.bgCard,
                        transition: "all 0.25s",
                      }}
                      onMouseEnter={(event) => { if (payMethod !== value) event.currentTarget.style.borderColor = `${GOLD}60`; }}
                      onMouseLeave={(event) => { if (payMethod !== value) event.currentTarget.style.borderColor = THEME.border; }}
                    >
                      <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: payMethod === value ? `rgba(201,162,39,0.15)` : THEME.bgDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", fontWeight: 600, color: payMethod === value ? GOLD : THEME.text, marginBottom: "3px" }}>{title}</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>{description}</p>
                      </div>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${payMethod === value ? GOLD : THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {payMethod === value && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: GOLD }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {payMethod === "UPI" && (
                  <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>

                    <DirectUPIPayment
                      amount={total}
                      orderId={upiPaymentRef}
                      upiId={BUSINESS_UPI_ID}
                      merchantName="Nouveauz"
                      onSuccess={handleUpiSuccess}
                      onPending={() => {}}
                    />

                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, marginTop: "14px", textAlign: "center", lineHeight: 1.7 }}>
                      On mobile, PhonePe, Google Pay, Paytm, and BHIM open directly. On desktop, the UPI ID can be copied.
                    </p>
                  </div>
                )}

                {payMethod === "CARD" && (
                  <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "2px", color: GOLD, marginBottom: "20px", fontWeight: 700, textAlign: "center" }}>
                      CREDIT / DEBIT CARD PAYMENT
                    </p>

                    <CardPayment
                      amount={total}
                      orderId={upiPaymentRef}
                      customerInfo={address}
                      merchantName="Nouveauz"
                      onSuccess={handleCardSuccess}
                      onFailure={(error) => {
                        if (error?.reason !== "cancelled") {
                          console.error("Card payment failed:", error);
                        }
                      }}
                    />

                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, marginTop: "14px", textAlign: "center", lineHeight: 1.7 }}>
                      Payment opens only after valid card details are entered.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <BtnOutline onClick={() => setStep(1)} color={THEME.textMuted} style={{ borderRadius: "12px" }}>← Back</BtnOutline>
                  {payMethod === "COD" && (
                    <BtnPrimary
                      onClick={() => setStep(3)}
                      style={{ borderRadius: "12px", padding: "15px 40px" }}
                    >
                      Review Order →
                    </BtnPrimary>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "24px", fontWeight: 700 }}>REVIEW YOUR ORDER</p>

                <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: "20px 24px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: GOLD, fontWeight: 700 }}>DELIVERY ADDRESS</p>
                    <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>Edit</button>
                  </div>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.text, fontWeight: 600 }}>{address.name}</p>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted, lineHeight: 1.7 }}>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>📱 {address.phone}</p>
                </div>

                <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: "20px 24px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: GOLD, fontWeight: 700 }}>PAYMENT METHOD</p>
                    <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>Edit</button>
                  </div>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.text, fontWeight: 600 }}>
                    {payMethod === "COD" ? "💵 Cash on Delivery" : payMethod === "UPI" ? "📲 Direct UPI Intent Payment" : "💳 Credit / Debit Card Payment"}
                  </p>
                </div>
                <div style={{ marginBottom: "16px", display: "grid", gap: "10px" }}>
                  {[["🔒", "100% Secure Checkout"], ["📲", "Direct UPI Intent"], ["💬", "WhatsApp Order Updates"], ["⚡", "Fast Dispatch"], ["✅", "Authentic Fabrics"]].map(([icon, text]) => (
                    <div key={text} style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "16px" }}>{icon}</span>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted }}>{text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#25D36610", border: "1px solid #25D36640", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "22px" }}>💬</span>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: "#128C7E" }}>
                    Order updates will be sent to <strong>{address.phone}</strong> via WhatsApp
                  </p>
                </div>

                <div style={{ background: "#fff5f5", border: `1.5px solid ${CRIMSON}40`, borderRadius: "12px", padding: "14px 18px", marginBottom: "24px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted, lineHeight: 1.7 }}>
                    <strong style={{ color: CRIMSON }}>No Return / No Exchange:</strong> All sales are final. Please verify size and product details before ordering.
                  </p>
                </div>

                <BtnPrimary onClick={handleOrder} disabled={processing} style={{ borderRadius: "12px", padding: "16px 48px", width: "100%", justifyContent: "center", fontSize: "12px", letterSpacing: "2px" }}>
                  {processing ? "Placing Order... 🌸" : `Place Order · ₹${total.toLocaleString("en-IN")}`}
                </BtnPrimary>
              </div>
            )}
          </div>

          <div>
            <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "clamp(16px, 5vw, 24px)", position: "sticky", top: "100px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "20px", fontWeight: 700 }}>ORDER SUMMARY</p>

              <div style={{ maxHeight: "280px", overflowY: "auto", marginBottom: "20px", paddingRight: "4px" }}>
                {cart.map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "14px", paddingBottom: "14px", borderBottom: index < cart.length - 1 ? `1px solid ${THEME.border}` : "none" }}>
                    <div style={{ width: "54px", height: "68px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: THEME.bgDark }}>
                      <img
                        src={resolveImageUrl(item.images?.[0], "/ethnic1.jpeg")}
                        alt={item.title || item.name || "Product"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(event) => { event.target.src = "/ethnic1.jpeg"; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>{item.title || item.name}</p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textMuted }}>Size: {item.size} · Qty: {item.qty}</p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: GOLD, fontWeight: 700, marginTop: "4px" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>Subtotal</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text }}>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>CGST 2.5%</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text }}>₹{cgst.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>SGST 2.5%</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text }}>₹{sgst.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>Shipping</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: shipping === 0 ? "#2ecc71" : THEME.text }}>{shipping === 0 ? '🎉 Free' : `₹${shipping}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: `1px solid ${THEME.border}` }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: THEME.text }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: 700, color: GOLD }}>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                {[["🔒", "100% Secure Checkout"], ["💳", "Razorpay Payment Modal"], ["💬", "WhatsApp Order Updates"], ["⚡", "Fast Dispatch"], ["✅", "Authentic Fabrics"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>{icon}</span>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
