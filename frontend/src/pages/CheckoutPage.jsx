import { useContext, useState } from "react";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { AppDataContext } from "../context/Providers";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";

const GOLD    = "#C9A227";
const CRIMSON = "#B71C1C";

export default function CheckoutPage({ setPage }) {
  const { cart, dispatch: cartDispatch } = useContext(CartContext);
  const { placeOrder }   = useContext(AppDataContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [step,       setStep]       = useState(1);
  const [address,    setAddress]    = useState({ name:"", phone:"", email:"", street:"", city:"", state:"", pincode:"" });
  const [payMethod,  setPayMethod]  = useState("COD");
  const [processing, setProcessing] = useState(false);
  const [errors,     setErrors]     = useState({});

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
    setProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const oid = await placeOrder(address, cart, payMethod);
      cartDispatch({ type:"CLEAR" });
      localStorage.setItem("lastOrderId", oid);
      setPage("OrderSuccess");
    } catch (err) {
      console.error("Order failed:", err);
    } finally {
      setProcessing(false);
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
          Please login first to place your order and track it in your account.
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:"10px",flexWrap:"wrap"}}>
          <BtnOutline onClick={()=>setPage("Cart")} color={THEME.textMuted} style={{borderRadius:"12px"}}>Back to Cart</BtnOutline>
          <BtnPrimary onClick={()=>{localStorage.setItem("nouveau_post_auth_page", "Checkout");setPage("Auth");}} style={{borderRadius:"12px"}}>Login to Continue</BtnPrimary>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:THEME.bg,minHeight:"100vh",color:THEME.text}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"60px 40px"}}>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"42px",marginBottom:"8px",color:THEME.text}}>Checkout</h1>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:THEME.textMuted,marginBottom:"40px"}}>Logged in checkout</p>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",marginBottom:"48px",flexWrap:"wrap",gap:"8px"}}>
          {["Address","Payment","Review"].map((s,i) => (
            <div key={s} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",cursor:step>i+1?"pointer":"default"}} onClick={()=>step>i+1&&setStep(i+1)}>
                <div style={{
                  width:"34px",height:"34px",borderRadius:"50%",
                  background: step>i+1 ? `linear-gradient(135deg,${CRIMSON},${GOLD})` : step===i+1 ? GOLD : THEME.bgCard,
                  border: step===i+1 ? `none` : `1px solid ${THEME.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"13px",fontWeight:700,
                  color: step>=i+1 ? "#fff" : THEME.textLight,
                  transition:"all 0.3s",fontFamily:"'Poppins',sans-serif",
                }}>
                  {step>i+1 ? "✓" : i+1}
                </div>
                <span style={{fontSize:"10px",letterSpacing:"2px",color:step>=i+1?THEME.text:THEME.textLight,fontFamily:"'Poppins',sans-serif",fontWeight:step>=i+1?600:400,textTransform:"uppercase"}}>{s}</span>
              </div>
              {i<2 && <div style={{width:"48px",height:"1.5px",background:step>i+1?GOLD:THEME.border,margin:"0 12px",transition:"all 0.3s"}}/>}
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
                    ["phone","Phone Number","tel","1fr"],
                    ["email","Email Address","email","1fr 1fr"],
                    ["street","Street Address","text","1fr 1fr"],
                    ["city","City","text","1fr"],
                    ["state","State","text","1fr"],
                    ["pincode","Pincode","text","1fr"],
                  ].map(([key,label,type,cols]) => (
                    <div key={key} style={{gridColumn:cols==="1fr 1fr"?"1/-1":"auto"}}>
                      <label style={{fontFamily:"'Poppins',sans-serif",fontSize:"9px",letterSpacing:"2px",color:errors[key]?CRIMSON:THEME.textMuted,display:"block",marginBottom:"6px",fontWeight:600,textTransform:"uppercase"}}>{label}{errors[key]&&<span style={{color:CRIMSON,marginLeft:"6px"}}>*</span>}</label>
                      <input type={type} value={address[key]} onChange={e=>setAddress(a=>({...a,[key]:e.target.value}))} style={field(key)}
                        onFocus={e=>e.target.style.borderColor=GOLD}
                        onBlur={e=>e.target.style.borderColor=errors[key]?CRIMSON:THEME.border} />
                    </div>
                  ))}
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
                <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"32px"}}>
                  {[
                    ["COD","💵","Cash on Delivery","Pay when your order arrives"],
                    ["UPI","📱","UPI / QR Code","Pay via any UPI app — instant confirmation"],
                    ["Razorpay","🔒","Razorpay (Card/NetBanking)","Secure online payment — all cards accepted"],
                  ].map(([val,icon,title,desc])=>(
                    <div key={val} onClick={()=>setPayMethod(val)} style={{
                      display:"flex",alignItems:"center",gap:"16px",
                      padding:"20px 24px",borderRadius:"14px",cursor:"pointer",
                      border:`2px solid ${payMethod===val?GOLD:THEME.border}`,
                      background:payMethod===val?`rgba(201,162,39,0.08)`:THEME.bgCard,
                      transition:"all 0.25s",
                    }}
                      onMouseEnter={e=>{if(payMethod!==val){e.currentTarget.style.borderColor=`${GOLD}60`;}}}
                      onMouseLeave={e=>{if(payMethod!==val){e.currentTarget.style.borderColor=THEME.border;}}}>
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

                {/* UPI QR */}
                {payMethod==="UPI" && (
                  <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"14px",padding:"24px",marginBottom:"20px",textAlign:"center"}}>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",color:GOLD,marginBottom:"16px",fontWeight:700}}>SCAN TO PAY</p>
                    <div style={{display:"inline-block",background:"#fff",padding:"12px",borderRadius:"12px",boxShadow:`0 4px 16px rgba(201,162,39,0.2)`,marginBottom:"12px"}}>
                      <img src="/payment-qr.jpeg" alt="UPI QR" style={{width:"180px",height:"180px",objectFit:"contain",display:"block"}} onError={e=>e.target.style.display="none"} />
                    </div>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:THEME.textMuted}}>Scan with PhonePe, GPay, Paytm or any UPI app</p>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:GOLD,marginTop:"8px",fontWeight:600}}>Amount: ₹{total.toLocaleString("en-IN")}</p>
                  </div>
                )}

                <div style={{display:"flex",gap:"12px"}}>
                  <BtnOutline onClick={()=>setStep(1)} color={THEME.textMuted} style={{borderRadius:"12px"}}>← Back</BtnOutline>
                  <BtnPrimary onClick={()=>setStep(3)} style={{borderRadius:"12px",padding:"15px 40px"}}>Review Order →</BtnPrimary>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step===3 && (
              <div>
                <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"24px",fontWeight:700}}>REVIEW ORDER</p>

                {/* Address summary */}
                <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"14px",padding:"20px 24px",marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"2px",color:GOLD,fontWeight:700}}>DELIVERY ADDRESS</p>
                    <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:THEME.textMuted,cursor:"pointer",fontSize:"11px",fontFamily:"'Poppins',sans-serif"}}>Edit</button>
                  </div>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",color:THEME.text,fontWeight:600}}>{address.name}</p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted,lineHeight:1.7}}>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted}}>📱 {address.phone}</p>
                </div>

                {/* Payment summary */}
                <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"14px",padding:"20px 24px",marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                    <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"2px",color:GOLD,fontWeight:700}}>PAYMENT METHOD</p>
                    <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:THEME.textMuted,cursor:"pointer",fontSize:"11px",fontFamily:"'Poppins',sans-serif"}}>Edit</button>
                  </div>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",color:THEME.text,fontWeight:600}}>{payMethod==="COD"?"💵 Cash on Delivery":payMethod==="UPI"?"📱 UPI / QR Code":"🔒 Razorpay"}</p>
                </div>

                {/* No return policy reminder */}
                <div style={{background:"#fff5f5",border:`1.5px solid ${CRIMSON}40`,borderRadius:"12px",padding:"14px 18px",marginBottom:"24px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"18px",flexShrink:0}}>⚠️</span>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted,lineHeight:1.7}}>
                    <strong style={{color:CRIMSON}}>No Return / No Exchange:</strong> By placing this order you confirm all sales are final. Please verify your size and product details.
                  </p>
                </div>

                <BtnPrimary onClick={handleOrder} disabled={processing} style={{borderRadius:"12px",padding:"16px 48px",width:"100%",justifyContent:"center",fontSize:"12px",letterSpacing:"2px"}}>
                  {processing ? "Placing Order..." : `Place Order · ₹${total.toLocaleString("en-IN")}`}
                </BtnPrimary>
              </div>
            )}
          </div>

          {/* ── Order Summary sidebar ── */}
          <div>
            <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"16px",padding:"24px",position:"sticky",top:"100px"}}>
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"20px",fontWeight:700}}>ORDER SUMMARY</p>

              {/* Cart items */}
              <div style={{maxHeight:"280px",overflowY:"auto",marginBottom:"20px",paddingRight:"4px"}}>
                {cart.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:"12px",marginBottom:"14px",paddingBottom:"14px",borderBottom:i<cart.length-1?`1px solid ${THEME.border}`:"none"}}>
                    <div style={{width:"54px",height:"68px",borderRadius:"8px",overflow:"hidden",flexShrink:0,background:THEME.bgDark}}>
                      <img src={item.images?.[0]||"/ethnic1.jpeg"} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.src="/ethnic1.jpeg"} />
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",fontWeight:600,color:THEME.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:"3px"}}>{item.title}</p>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:THEME.textMuted}}>Size: {item.size} · Qty: {item.qty}</p>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:GOLD,fontWeight:700,marginTop:"4px"}}>₹{(item.price*item.qty).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{borderTop:`1px solid ${THEME.border}`,paddingTop:"16px"}}>
                {[["Subtotal",`₹${subtotal.toLocaleString("en-IN")}`],["Shipping",shipping===0?"Free":`₹${shipping}`]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                    <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted}}>{l}</span>
                    <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:shipping===0&&l==="Shipping"?"#2ecc71":THEME.text}}>{v}</span>
                  </div>
                ))}
                {shipping===0&&<p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:"#2ecc71",marginBottom:"12px"}}>🎉 You qualify for free shipping!</p>}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:"12px",borderTop:`1px solid ${THEME.border}`}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,color:THEME.text}}>Total</span>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,color:GOLD}}>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Secure badges */}
              <div style={{marginTop:"20px",paddingTop:"16px",borderTop:`1px solid ${THEME.border}`,display:"flex",flexDirection:"column",gap:"8px"}}>
                {[["🔒","100% Secure Checkout"],["⚡","Fast Dispatch"],["✅","Authentic Fabrics"]].map(([i,t])=>(
                  <div key={t} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"14px"}}>{i}</span>
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
