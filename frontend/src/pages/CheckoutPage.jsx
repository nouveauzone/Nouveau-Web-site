import { useContext, useState, useEffect } from "react";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { AppDataContext } from "../context/Providers";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import { resolveImageUrl } from "../utils/imageUrl";

const GOLD    = "#C9A227";
const CRIMSON = "#B71C1C";

// ─── Real UPI QR Code using Google Charts API (no npm install needed!) ────────
// This generates a REAL scannable QR that works with GPay, PhonePe, Paytm
function RealUpiQR({ amount, upiId = "amderontrendzpvtltd@kotak", upiName = "Nouveau" }) {
  const [imgError, setImgError] = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  // UPI payment string — this is the standard format ALL UPI apps recognize
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=NouveauOrder`;

  // Google Charts QR API — generates real scannable QR (free, no key needed)
  const qrUrl = `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(upiString)}&choe=UTF-8&chld=M|2`;

  // Fallback: QR Server API
  const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&margin=10`;

  return (
    <div style={{ textAlign:"center" }}>
      {/* QR Code frame */}
      <div style={{ display:"inline-block", background:"#fff", padding:"16px", borderRadius:"16px", boxShadow:"0 8px 32px rgba(201,162,39,0.25)", border:"2px solid #D4AF3740", position:"relative" }}>
        {!loaded && !imgError && (
          <div style={{ width:"220px", height:"220px", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px" }}>
            <div style={{ width:"40px", height:"40px", border:`3px solid ${GOLD}`, borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:"#888" }}>Loading QR...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!imgError ? (
          <img
            src={qrUrl}
            alt="UPI QR Code"
            width="220"
            height="220"
            style={{ display: loaded ? "block" : "none", borderRadius:"8px" }}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setImgError(true);
              setLoaded(true);
            }}
          />
        ) : (
          // Fallback QR Server
          <img
            src={fallbackUrl}
            alt="UPI QR Code"
            width="220"
            height="220"
            style={{ display:"block", borderRadius:"8px" }}
            onError={(e) => {
              // Final fallback — show manual UPI
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        )}

        {/* Manual fallback if all QR APIs fail */}
        <div style={{ display:"none", width:"220px", height:"220px", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px", background:"#f8f5f0", borderRadius:"8px" }}>
          <span style={{ fontSize:"40px" }}>📱</span>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:"#555", textAlign:"center" }}>Open GPay/PhonePe</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:700, color:"#1a1a1a" }}>Send to: {upiId}</p>
        </div>

        {/* Nouveau logo overlay in corner */}
        <div style={{ position:"absolute", bottom:"-10px", right:"0", maxWidth:"100%", width:"32px", height:"32px", background:THEME.crimson||"#B76E79", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
          <span style={{ color:"#fff", fontSize:"14px", fontFamily:"Georgia,serif", fontWeight:"bold" }}>N</span>
        </div>
      </div>

      {/* UPI ID display */}
      <div style={{ marginTop:"16px", background:"#f8f5f0", border:"1px solid #D4AF3740", borderRadius:"10px", padding:"10px 20px", display:"inline-flex", alignItems:"center", gap:"10px" }}>
        <span style={{ fontSize:"18px" }}>💳</span>
        <div style={{ textAlign:"left" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:"#888", letterSpacing:"1px", marginBottom:"2px" }}>UPI ID</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"15px", fontWeight:700, color:"#1a1a1a" }}>{upiId}</p>
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(upiId); }}
          style={{ background:"none", border:`1px solid ${GOLD}`, color:GOLD, padding:"4px 10px", borderRadius:"6px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:600 }}
          title="Copy UPI ID"
        >📋</button>
      </div>

      {/* Amount */}
      <div style={{ marginTop:"12px", background:`linear-gradient(135deg,${GOLD}15,${THEME.crimson||"#B76E79"}10)`, border:`1px solid ${GOLD}40`, borderRadius:"12px", padding:"12px 24px", display:"inline-block" }}>
        <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:"#888", letterSpacing:"1px", marginBottom:"4px" }}>AMOUNT TO PAY</p>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:700, color:GOLD }}>₹{Number(amount).toLocaleString("en-IN")}</p>
      </div>

      {/* UPI App logos */}
      <div style={{ marginTop:"16px", display:"flex", justifyContent:"center", gap:"12px", flexWrap:"wrap" }}>
        {[
          { name:"GPay",    color:"#4285F4", emoji:"🔵" },
          { name:"PhonePe", color:"#5F259F", emoji:"🟣" },
          { name:"Paytm",   color:"#00BAF2", emoji:"🔷" },
          { name:"BHIM",    color:"#FF6B00", emoji:"🟠" },
          { name:"Amazon",  color:"#FF9900", emoji:"🟡" },
        ].map(app => (
          <div key={app.name} style={{ background:`${app.color}15`, border:`1px solid ${app.color}30`, borderRadius:"8px", padding:"5px 10px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", fontWeight:700, color:app.color }}>{app.name}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:"#777", marginTop:"12px" }}>
        📷 Open any UPI app → Scan QR → Pay ₹{Number(amount).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function CheckoutPage({ setPage }) {
  const { cart, dispatch: cartDispatch } = useContext(CartContext);
  const { placeOrder }   = useContext(AppDataContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [step,         setStep]         = useState(1);
  const [address,      setAddress]      = useState({ name:"", phone:"", email:"", street:"", city:"", state:"", pincode:"" });
  const [payMethod,    setPayMethod]    = useState("COD");
  const [processing,   setProcessing]   = useState(false);
  const [errors,       setErrors]       = useState({});
  const [upiConfirmed, setUpiConfirmed] = useState(false);

  // ── IMPORTANT: Replace with your actual UPI ID ──
  const YOUR_UPI_ID   = "amderontrendzpvtltd@kotak";
  const YOUR_UPI_NAME = "Nouveau Store";

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping  = subtotal >= 2500 ? 0 : 199;
  const total     = subtotal + shipping;

  const validate = () => {
    const e = {};
    if (!address.name.trim())    e.name    = "Required";
    if (!address.phone.trim())   e.phone   = "Required";
    if (!address.email.trim())   e.email   = "Required";
    if (!address.street.trim())  e.street  = "Required";
    if (!address.city.trim())    e.city    = "Required";
    if (!address.state.trim())   e.state   = "Required";
    if (!address.pincode.trim()) e.pincode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("nouveau_post_auth_page", "Checkout");
      setPage("Auth");
      return;
    }

    if (payMethod === "UPI" && !upiConfirmed) {
      alert("Pehle UPI payment complete karo aur checkbox tick karo ✅");
      return;
    }

    setProcessing(true);
    try {
      const apiBase = (process.env.REACT_APP_API_URL || "/api").replace(/\/$/, "");

      if (payMethod === "Razorpay") {
        const token = localStorage.getItem("nouveau_token");
        const rpRes = await fetch(`${apiBase}/payments/razorpay/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: total }),
        });

        if (!rpRes.ok) {
          throw new Error("Razorpay order create nahi hua");
        }

        const rpData = await rpRes.json();

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: rpData.amount,
          currency: "INR",
          name: "Nouveau™",
          description: "Fashion Order",
          order_id: rpData.orderId,
          prefill: { name: address.name, email: address.email, contact: address.phone },
          theme: { color: "#C9A227" },
          handler: async function (response) {
            try {
              const oid = await placeOrder(address, cart, "Razorpay");

              await fetch(`${apiBase}/payments/razorpay/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("nouveau_token")}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: oid,
                }),
              });

              cartDispatch({ type: "CLEAR" });
              localStorage.setItem("lastOrderId", oid);
              setPage("OrderSuccess");
            } catch (err) {
              console.error("Razorpay verification failed:", err);
              alert("Payment ho gaya, lekin order verify nahi hua. Support se contact karo.");
            } finally {
              setProcessing(false);
            }
          },
          modal: { ondismiss: () => setProcessing(false) },
        };

        if (!window.Razorpay) {
          throw new Error("Razorpay SDK load nahi hua");
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      const oid = await placeOrder(address, cart, payMethod);
      cartDispatch({ type: "CLEAR" });
      localStorage.setItem("lastOrderId", oid);
      setPage("OrderSuccess");
    } catch (err) {
      console.error("Order failed:", err);
      alert("Order fail ho gaya. Dobara try karo.");
    } finally {
      if (payMethod !== "Razorpay") {
        setProcessing(false);
      }
    }
  };

  const field = (key) => ({
    width:"100%", background:THEME.bgCard,
    border:`1.5px solid ${errors[key] ? CRIMSON : THEME.border}`,
    color:THEME.text, padding:"13px 16px", fontSize:"14px", outline:"none",
    fontFamily:"'Poppins',sans-serif", transition:"border-color 0.2s", borderRadius:"10px",
  });

  if (!cart.length) return (
    <div style={{background:THEME.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"20px"}}>
      <div style={{fontSize:"48px"}}>🛒</div>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",color:THEME.textMuted}}>Your cart is empty</p>
      <BtnPrimary onClick={()=>setPage("Shop")} style={{borderRadius:"99px"}}>Continue Shopping</BtnPrimary>
    </div>
  );

  if (!isAuthenticated) return (
    <div style={{background:THEME.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 20px"}}>
      <div style={{maxWidth:"520px",width:"100%",background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"18px",padding:"34px 30px",textAlign:"center"}}>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,fontWeight:700,marginBottom:"10px"}}>SECURE CHECKOUT</p>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"30px",marginBottom:"10px",color:THEME.text}}>Login Required</h2>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted,lineHeight:1.7,marginBottom:"24px"}}>
          Please login first to place your order.
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:"10px",flexWrap:"wrap"}}>
          <BtnOutline onClick={()=>setPage("Cart")} color={THEME.textMuted} style={{borderRadius:"12px"}}>← Back to Cart</BtnOutline>
          <BtnPrimary onClick={()=>{localStorage.setItem("nouveau_post_auth_page","Checkout");setPage("Auth");}} style={{borderRadius:"12px"}}>Login to Continue</BtnPrimary>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:THEME.bg,minHeight:"100vh",color:THEME.text}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"60px 40px"}}>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"42px",marginBottom:"8px",color:THEME.text}}>Checkout</h1>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:THEME.textMuted,marginBottom:"40px"}}>Secure checkout — powered by Nouveau™</p>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",marginBottom:"48px",flexWrap:"wrap",gap:"8px"}}>
          {["Address","Payment","Review"].map((s,i) => (
            <div key={s} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",cursor:step>i+1?"pointer":"default"}} onClick={()=>step>i+1&&setStep(i+1)}>
                <div style={{width:"34px",height:"34px",borderRadius:"50%",background:step>i+1?`linear-gradient(135deg,${CRIMSON},${GOLD})`:step===i+1?GOLD:THEME.bgCard,border:step===i+1?"none":`1px solid ${THEME.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700,color:step>=i+1?"#fff":THEME.textLight,transition:"all 0.3s",fontFamily:"'Poppins',sans-serif"}}>
                  {step>i+1?"✓":i+1}
                </div>
                <span style={{fontSize:"10px",letterSpacing:"2px",color:step>=i+1?THEME.text:THEME.textLight,fontFamily:"'Poppins',sans-serif",fontWeight:step>=i+1?600:400,textTransform:"uppercase"}}>{s}</span>
              </div>
              {i<2&&<div style={{width:"48px",height:"1.5px",background:step>i+1?GOLD:THEME.border,margin:"0 12px",transition:"all 0.3s"}}/>}
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:"40px"}} className="cart-sidebar">
          <div>

            {/* ── STEP 1: Address ── */}
            {step===1 && (
              <div>
                <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"24px",fontWeight:700}}>DELIVERY ADDRESS</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                  {[
                    ["name","Full Name","text","1fr"],
                    ["phone","Phone Number (WhatsApp updates aayenge)","tel","1fr"],
                    ["email","Email Address","email","1fr 1fr"],
                    ["street","Street Address","text","1fr 1fr"],
                    ["city","City","text","1fr"],
                    ["state","State","text","1fr"],
                    ["pincode","Pincode","text","1fr"],
                  ].map(([key,label,type,cols])=>(
                    <div key={key} style={{gridColumn:cols==="1fr 1fr"?"1/-1":"auto"}}>
                      <label style={{fontFamily:"'Poppins',sans-serif",fontSize:"9px",letterSpacing:"2px",color:errors[key]?CRIMSON:THEME.textMuted,display:"block",marginBottom:"6px",fontWeight:600,textTransform:"uppercase"}}>
                        {label}{errors[key]&&<span style={{color:CRIMSON,marginLeft:"6px"}}>*</span>}
                      </label>
                      <input type={type} value={address[key]} onChange={e=>setAddress(a=>({...a,[key]:e.target.value}))} style={field(key)}
                        onFocus={e=>e.target.style.borderColor=GOLD}
                        onBlur={e=>e.target.style.borderColor=errors[key]?CRIMSON:THEME.border} />
                    </div>
                  ))}
                </div>

                {/* WhatsApp note */}
                <div style={{background:"#25D36610",border:"1px solid #25D36640",borderRadius:"10px",padding:"12px 16px",marginTop:"16px",display:"flex",gap:"10px",alignItems:"center"}}>
                  <span style={{fontSize:"20px"}}>💬</span>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:"#128C7E"}}>
                    <strong>WhatsApp updates</strong> — Order confirmation & tracking sent to your phone!
                  </p>
                </div>

                <div style={{marginTop:"32px"}}>
                  <BtnPrimary onClick={()=>{if(validate())setStep(2);}} style={{borderRadius:"12px",padding:"15px 40px"}}>
                    Continue to Payment →
                  </BtnPrimary>
                </div>
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step===2 && (
              <div>
                <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"24px",fontWeight:700}}>PAYMENT METHOD</p>

                <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"28px"}}>
                  {[
                    ["COD","💵","Cash on Delivery","Pay when your order arrives — safe & simple"],
                    ["UPI","📱","UPI / QR Code","Scan QR with GPay, PhonePe, Paytm — instant!"],
                    ["Razorpay","🔒","Razorpay (Card/Net Banking)","Secure online payment — all cards accepted"],
                  ].map(([val,icon,title,desc])=>(
                    <div key={val} onClick={()=>{setPayMethod(val);setUpiConfirmed(false);}} style={{
                      display:"flex",alignItems:"center",gap:"16px",
                      padding:"20px 24px",borderRadius:"14px",cursor:"pointer",
                      border:`2px solid ${payMethod===val?GOLD:THEME.border}`,
                      background:payMethod===val?`rgba(201,162,39,0.08)`:THEME.bgCard,
                      transition:"all 0.25s",
                    }}
                      onMouseEnter={e=>{if(payMethod!==val)e.currentTarget.style.borderColor=`${GOLD}60`;}}
                      onMouseLeave={e=>{if(payMethod!==val)e.currentTarget.style.borderColor=THEME.border;}}>
                      <div style={{width:"46px",height:"46px",borderRadius:"12px",background:payMethod===val?`rgba(201,162,39,0.15)`:THEME.bgDark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>{icon}</div>
                      <div style={{flex:1}}>
                        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",fontWeight:600,color:payMethod===val?GOLD:THEME.text,marginBottom:"3px"}}>{title}</p>
                        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted}}>{desc}</p>
                      </div>
                      <div style={{width:"20px",height:"20px",borderRadius:"50%",border:`2px solid ${payMethod===val?GOLD:THEME.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {payMethod===val&&<div style={{width:"10px",height:"10px",borderRadius:"50%",background:GOLD}}/>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── REAL UPI QR Section ── */}
                {payMethod==="UPI" && (
                  <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"16px",padding:"28px",marginBottom:"20px"}}>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",color:GOLD,marginBottom:"20px",fontWeight:700,textAlign:"center"}}>
                      📷 SCAN TO PAY
                    </p>

                    {/* REAL QR CODE */}
                    <RealUpiQR amount={total} upiId={YOUR_UPI_ID} upiName={YOUR_UPI_NAME} />

                    {/* Instructions */}
                    <div style={{marginTop:"20px",background:"#f0f9f4",border:"1px solid #c3e6cb",borderRadius:"10px",padding:"14px 16px"}}>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",fontWeight:700,color:"#155724",marginBottom:"8px"}}>📋 How to pay:</p>
                      {["Open GPay / PhonePe / Paytm / any UPI app","Tap 'Scan QR' or 'Pay'","Scan this QR code","Enter amount if not auto-filled: ₹"+total.toLocaleString("en-IN"),"Complete payment & take screenshot"].map((step,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",marginBottom:"4px"}}>
                          <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:"#155724",fontWeight:700,minWidth:"16px"}}>{i+1}.</span>
                          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:"#155724"}}>{step}</p>
                        </div>
                      ))}
                    </div>

                    {/* Confirmation checkbox */}
                    <div style={{marginTop:"16px",background:"#fffbf0",border:`1px solid ${GOLD}40`,borderRadius:"10px",padding:"14px 16px",display:"flex",gap:"12px",alignItems:"flex-start"}}>
                      <input type="checkbox" id="upiConfirm" checked={upiConfirmed} onChange={e=>setUpiConfirmed(e.target.checked)}
                        style={{width:"18px",height:"18px",cursor:"pointer",marginTop:"2px",accentColor:GOLD}} />
                      <label htmlFor="upiConfirm" style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.text,cursor:"pointer",lineHeight:1.5}}>
                        ✅ I have completed the UPI payment of <strong style={{color:GOLD}}>₹{total.toLocaleString("en-IN")}</strong>
                      </label>
                    </div>
                  </div>
                )}

                <div style={{display:"flex",gap:"12px"}}>
                  <BtnOutline onClick={()=>setStep(1)} color={THEME.textMuted} style={{borderRadius:"12px"}}>← Back</BtnOutline>
                  <BtnPrimary
                    onClick={()=>setStep(3)}
                    disabled={payMethod==="UPI"&&!upiConfirmed}
                    style={{borderRadius:"12px",padding:"15px 40px",opacity:payMethod==="UPI"&&!upiConfirmed?0.5:1,cursor:payMethod==="UPI"&&!upiConfirmed?"not-allowed":"pointer"}}
                  >
                    {payMethod==="UPI"&&!upiConfirmed?"✅ Confirm Payment First":"Review Order →"}
                  </BtnPrimary>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step===3 && (
              <div>
                <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"24px",fontWeight:700}}>REVIEW YOUR ORDER</p>

                <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"14px",padding:"20px 24px",marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"2px",color:GOLD,fontWeight:700}}>DELIVERY ADDRESS</p>
                    <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:THEME.textMuted,cursor:"pointer",fontSize:"11px",fontFamily:"'Poppins',sans-serif"}}>Edit</button>
                  </div>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",color:THEME.text,fontWeight:600}}>{address.name}</p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted,lineHeight:1.7}}>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted}}>📱 {address.phone}</p>
                </div>

                <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"14px",padding:"20px 24px",marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"2px",color:GOLD,fontWeight:700}}>PAYMENT METHOD</p>
                    <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:THEME.textMuted,cursor:"pointer",fontSize:"11px",fontFamily:"'Poppins',sans-serif"}}>Edit</button>
                  </div>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",color:THEME.text,fontWeight:600}}>
                    {payMethod==="COD"?"💵 Cash on Delivery":payMethod==="UPI"?"📱 UPI / QR Code (Paid ✅)":"🔒 Razorpay"}
                  </p>
                </div>

                {/* WhatsApp reminder */}
                <div style={{background:"#25D36610",border:"1px solid #25D36640",borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",display:"flex",gap:"12px",alignItems:"center"}}>
                  <span style={{fontSize:"22px"}}>💬</span>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:"#128C7E"}}>
                    Order updates will be sent to <strong>{address.phone}</strong> via WhatsApp
                  </p>
                </div>

                <div style={{background:"#fff5f5",border:`1.5px solid ${CRIMSON}40`,borderRadius:"12px",padding:"14px 18px",marginBottom:"24px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"18px",flexShrink:0}}>⚠️</span>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted,lineHeight:1.7}}>
                    <strong style={{color:CRIMSON}}>No Return / No Exchange:</strong> All sales are final. Please verify size and product details before ordering.
                  </p>
                </div>

                <BtnPrimary onClick={handleOrder} disabled={processing} style={{borderRadius:"12px",padding:"16px 48px",width:"100%",justifyContent:"center",fontSize:"12px",letterSpacing:"2px"}}>
                  {processing?"Placing Order... 🌸":`Place Order · ₹${total.toLocaleString("en-IN")}`}
                </BtnPrimary>
              </div>
            )}
          </div>

          {/* ── Order Summary sidebar ── */}
          <div>
            <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"16px",padding:"24px",position:"sticky",top:"100px"}}>
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"20px",fontWeight:700}}>ORDER SUMMARY</p>

              <div style={{maxHeight:"280px",overflowY:"auto",marginBottom:"20px",paddingRight:"4px"}}>
                {cart.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:"12px",marginBottom:"14px",paddingBottom:"14px",borderBottom:i<cart.length-1?`1px solid ${THEME.border}`:"none"}}>
                    <div style={{width:"54px",height:"68px",borderRadius:"8px",overflow:"hidden",flexShrink:0,background:THEME.bgDark}}>
                      <img src={resolveImageUrl(item.images?.[0], "/ethnic1.jpeg")} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.src="/ethnic1.jpeg"} />
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",fontWeight:600,color:THEME.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:"3px"}}>{item.title}</p>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:THEME.textMuted}}>Size: {item.size} · Qty: {item.qty}</p>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:GOLD,fontWeight:700,marginTop:"4px"}}>₹{(item.price*item.qty).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{borderTop:`1px solid ${THEME.border}`,paddingTop:"16px"}}>
                {[["Subtotal",`₹${subtotal.toLocaleString("en-IN")}`],["Shipping",shipping===0?"🎉 Free":`₹${shipping}`]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                    <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted}}>{l}</span>
                    <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:shipping===0&&l==="Shipping"?"#2ecc71":THEME.text}}>{v}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:"12px",borderTop:`1px solid ${THEME.border}`}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,color:THEME.text}}>Total</span>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,color:GOLD}}>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div style={{marginTop:"20px",paddingTop:"16px",borderTop:`1px solid ${THEME.border}`,display:"flex",flexDirection:"column",gap:"8px"}}>
                {[["🔒","100% Secure Checkout"],["📱","Real UPI QR Payment"],["💬","WhatsApp Order Updates"],["⚡","Fast Dispatch"],["✅","Authentic Fabrics"]].map(([ic,t])=>(
                  <div key={t} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"14px"}}>{ic}</span>
                    <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted}}>{t}</span>
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
