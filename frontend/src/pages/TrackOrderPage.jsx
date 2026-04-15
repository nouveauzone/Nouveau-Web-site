import { useState, useContext, useEffect } from "react";
import { AppDataContext } from "../context/Providers";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import OrnamentDivider from "../components/OrnamentDivider";
import { BtnPrimary, BtnOutline } from "../components/Buttons";
import Footer from "../components/Footer";

const STATUS_CONFIG = {
  pending:    { color: "#D4AF37",  bg: "#D4AF3715", icon: "⏳", label: "Pending"    },
  processing: { color: "#2196F3",  bg: "#2196F315", icon: "⚙️",  label: "Processing" },
  shipped:    { color: "#9C27B0",  bg: "#9C27B015", icon: "🚀", label: "Shipped"    },
  delivered:  { color: "#22c55e",  bg: "#22c55e15", icon: "✅", label: "Delivered"  },
  cancelled:  { color: "#B76E79",  bg: "#B76E7915", icon: "❌", label: "Cancelled"  },
};

const STEPS_MAP = { pending:0, processing:1, shipped:2, delivered:4, cancelled:-1 };

export default function TrackOrderPage({ setPage }) {
  const { allOrders = [] }            = useContext(AppDataContext);
  const { isAuthenticated, user }     = useContext(AuthContext);
  const [orderId,   setOrderId]       = useState("");
  const [result,    setResult]        = useState(null);
  const [notFound,  setNotFound]      = useState(false);
  const [searching, setSearching]     = useState(false);
  const [myOrders,  setMyOrders]      = useState([]);
  const [activeTab, setActiveTab]     = useState("track");

  useEffect(() => {
    const lastId = localStorage.getItem("lastOrderId");
    if (lastId) setOrderId(lastId);
    if (isAuthenticated && user) {
      const uOrders = allOrders.filter(o =>
        o.email === user.email ||
        o.customer === user.name ||
        o.shippingAddress?.email === user.email
      );
      setMyOrders(uOrders);
      if (uOrders.length > 0) setActiveTab("myorders");
    }
  }, [allOrders, isAuthenticated, user]);

  const handleTrack = (idToTrack) => {
    const tid = idToTrack || orderId;
    if (!tid.trim()) return;
    setSearching(true); setNotFound(false); setResult(null);
    setTimeout(() => {
      const found = allOrders.find(o => o._id?.toLowerCase() === tid.trim().toLowerCase());
      if (found) { setResult(found); setNotFound(false); setActiveTab("track"); }
      else { setResult(null); setNotFound(true); }
      setSearching(false);
    }, 500);
  };

  const handleQuickTrack = (order) => {
    setOrderId(order._id); setResult(order);
    setNotFound(false); setActiveTab("track");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const getProgress = (status) => {
    if (status === "cancelled") return 0;
    return Math.round(((STEPS_MAP[status] ?? 0) / 4) * 100);
  };

  const cfg = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG.pending) : null;

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${THEME.crimsonDark} 0%, #7b2d3e 50%, #9f5b65 100%)`, padding:"60px 40px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)` }} />
        <div style={{ maxWidth:"900px", margin:"0 auto", position:"relative", zIndex:1 }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:"#D4AF37", marginBottom:"10px", textTransform:"uppercase" }}>Real-Time Status</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:700, color:"#fff", marginBottom:"8px" }}>Track Your Order</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", fontFamily:"'Poppins',sans-serif", marginBottom:"36px" }}>Enter Order ID or view your recent orders below</p>

          {/* Search */}
          <div style={{ background:"rgba(255,255,255,0.10)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"16px 16px 0 0", padding:"24px 28px" }}>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <input
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Enter Order ID  e.g. NVU12345678"
                onKeyDown={e => e.key==="Enter" && handleTrack()}
                style={{ flex:1, minWidth:"200px", padding:"14px 20px", background:"rgba(255,255,255,0.95)", border:"none", borderRadius:"12px", fontSize:"15px", outline:"none", fontFamily:"'Poppins',sans-serif", color:"#1a1a1a" }}
              />
              <BtnPrimary onClick={() => handleTrack()} style={{ borderRadius:"12px", minWidth:"130px", justifyContent:"center" }}>
                {searching ? "Searching..." : "🔍 Track"}
              </BtnPrimary>
            </div>
            {allOrders.length > 0 && (
              <div style={{ marginTop:"14px", display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)" }}>Recent:</span>
                {allOrders.slice(0,4).map(o => (
                  <button key={o._id}
                    onClick={() => { setOrderId(o._id); handleTrack(o._id); }}
                    style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.85)", padding:"4px 14px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:600 }}
                  >{o._id}</button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:"4px", marginTop:"2px" }}>
            {[{id:"track",label:"📦 Track Order"},{id:"myorders",label:`🛍️ My Orders${myOrders.length>0?` (${myOrders.length})`:""}`}].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding:"12px 24px", background:activeTab===tab.id?THEME.bgCard:"rgba(255,255,255,0.08)", border:"none", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:activeTab===tab.id?700:400, color:activeTab===tab.id?THEME.crimson:"rgba(255,255,255,0.7)", borderRadius:"10px 10px 0 0", transition:"all 0.2s" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"40px 24px 60px" }}>

        {/* MY ORDERS TAB */}
        {activeTab==="myorders" && (
          <div>
            {!isAuthenticated ? (
              <div style={{ textAlign:"center", padding:"60px 20px", background:THEME.bgCard, borderRadius:"16px", border:`1px solid ${THEME.border}` }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔐</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", marginBottom:"8px" }}>Login to View Your Orders</h3>
                <p style={{ fontFamily:"'Poppins',sans-serif", color:THEME.textMuted, marginBottom:"24px" }}>Sign in to see your order history and track them easily.</p>
                <BtnPrimary onClick={() => setPage("Auth")} style={{ borderRadius:"99px" }}>Login / Sign Up →</BtnPrimary>
              </div>
            ) : myOrders.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", background:THEME.bgCard, borderRadius:"16px", border:`1px solid ${THEME.border}` }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>📭</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", marginBottom:"8px" }}>No Orders Yet</h3>
                <p style={{ fontFamily:"'Poppins',sans-serif", color:THEME.textMuted, marginBottom:"24px" }}>You haven't placed any orders. Start shopping!</p>
                <BtnPrimary onClick={() => setPage("Shop")} style={{ borderRadius:"99px" }}>Shop Now →</BtnPrimary>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                {myOrders.map(order => {
                  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const progress = getProgress(order.status);
                  return (
                    <div key={order._id}
                      style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"24px", borderLeft:`4px solid ${s.color}`, transition:"all 0.3s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"10px", marginBottom:"16px" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
                            <span style={{ fontSize:"18px" }}>{s.icon}</span>
                            <code style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:700, color:THEME.crimson }}>{order._id}</code>
                          </div>
                          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", fontWeight:600, color:THEME.text, marginBottom:"2px" }}>{order.product||"Order"}</p>
                          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>{order.date} · ₹{order.price?.toLocaleString("en-IN")}</p>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                          <span style={{ background:s.bg, color:s.color, padding:"5px 14px", borderRadius:"99px", fontSize:"11px", letterSpacing:"1.5px", fontFamily:"'Poppins',sans-serif", fontWeight:700, textTransform:"uppercase" }}>{s.label}</span>
                          <button onClick={() => handleQuickTrack(order)}
                            style={{ background:"none", border:`1px solid ${THEME.crimson}`, color:THEME.crimson, padding:"5px 14px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:600, transition:"all 0.2s" }}
                            onMouseEnter={e=>{e.currentTarget.style.background=THEME.crimson;e.currentTarget.style.color="#fff";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=THEME.crimson;}}
                          >Track →</button>
                        </div>
                      </div>
                      {order.status!=="cancelled" && (
                        <div>
                          <div style={{ height:"4px", background:THEME.border, borderRadius:"99px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(to right,${THEME.crimson},#D4AF37)`, borderRadius:"99px", transition:"width 0.5s ease" }} />
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
                            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:THEME.crimson }}>Placed</span>
                            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:progress===100?THEME.crimson:THEME.textLight }}>Delivered</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TRACK ORDER TAB */}
        {activeTab==="track" && (
          <div>
            {notFound && (
              <div style={{ background:"#fff3cd", border:"1px solid #ffc107", borderRadius:"14px", padding:"24px", display:"flex", gap:"14px", alignItems:"center", marginBottom:"24px" }}>
                <span style={{ fontSize:"28px" }}>⚠️</span>
                <div>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#856404", marginBottom:"4px" }}>Order Not Found</p>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:"#856404" }}>No order found with ID "<strong>{orderId}</strong>". Please check and try again.</p>
                </div>
              </div>
            )}

            {result && cfg && (
              <div>
                {/* Status Banner */}
                <div style={{ background:`linear-gradient(135deg,${cfg.color}20,${cfg.color}08)`, border:`1.5px solid ${cfg.color}40`, borderRadius:"16px", padding:"20px 24px", display:"flex", alignItems:"center", gap:"16px", marginBottom:"20px" }}>
                  <span style={{ fontSize:"32px" }}>{cfg.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", letterSpacing:"2px", color:cfg.color, fontWeight:700, marginBottom:"2px" }}>ORDER STATUS</p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:cfg.color }}>{cfg.label.toUpperCase()}</p>
                  </div>
                  <code style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted, background:THEME.bgDark, padding:"6px 12px", borderRadius:"8px" }}>{result._id}</code>
                </div>

                {/* Progress Steps */}
                {result.status!=="cancelled" && (
                  <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"24px", marginBottom:"20px" }}>
                    <div style={{ position:"relative" }}>
                      {/* Line */}
                      <div style={{ position:"absolute", top:"15px", left:"20px", right:"20px", height:"3px", background:THEME.border, zIndex:0, borderRadius:"99px" }}>
                        <div style={{ height:"100%", width:`${getProgress(result.status)}%`, background:`linear-gradient(to right,${THEME.crimson},#D4AF37)`, borderRadius:"99px", transition:"width 0.8s ease" }} />
                      </div>
                      {/* Circles */}
                      <div style={{ display:"flex", justifyContent:"space-between", position:"relative", zIndex:1 }}>
                        {["Order\nPlaced","Processing","Shipped","Out for\nDelivery","Delivered"].map((label,i) => {
                          const done = (STEPS_MAP[result.status]??0)>=i;
                          const current = (STEPS_MAP[result.status]??0)===i;
                          return (
                            <div key={i} style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                              <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:done?(current?"#D4AF37":THEME.crimson):THEME.bgDark, border:`2px solid ${done?(current?"#D4AF37":THEME.crimson):THEME.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", boxShadow:current?`0 0 0 5px #D4AF3725`:"none", transition:"all 0.3s" }}>
                                {done?(current?"●":"✓"):"○"}
                              </div>
                              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:done?(current?"#D4AF37":THEME.crimson):THEME.textLight, fontWeight:current?700:400, whiteSpace:"pre-line", lineHeight:1.3 }}>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }} className="grid-2col">
                  {[
                    ["👤 Customer", result.customer||"—"],
                    ["💰 Amount", `₹${result.price?.toLocaleString("en-IN")||"—"}`],
                    ["💳 Payment", result.paymentMethod||"COD"],
                    ["📅 Date", result.date||"—"],
                    ["📦 Product", result.product||"—"],
                    ["🗂️ Qty", `${result.qty||1} pcs${result.size?" · "+result.size:""}`],
                    ["📍 Address", [result.address,result.city,result.state,result.pincode].filter(Boolean).join(", ")||"—"],
                  ].map(([label,value]) => (
                    <div key={label} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"12px", padding:"14px 18px", gridColumn:label.includes("Address")?"1/-1":"auto" }}>
                      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"1.5px", color:THEME.textLight, marginBottom:"4px" }}>{label.toUpperCase()}</p>
                      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.text, fontWeight:600 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"28px" }}>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"3px", color:THEME.crimson, fontWeight:700, marginBottom:"24px" }}>TRACKING TIMELINE</p>
                  <div style={{ position:"relative", paddingLeft:"32px" }}>
                    {(result.steps||[]).map((step,i) => {
                      const isLast = i===(result.steps?.length||0)-1;
                      const isCurrent = step.done && !result.steps[i+1]?.done;
                      return (
                        <div key={i} style={{ display:"flex", gap:"16px", marginBottom:isLast?0:"28px", position:"relative" }}>
                          <div style={{ position:"absolute", left:"-32px", top:"2px", width:"22px", height:"22px", borderRadius:"50%", background:step.done?(isCurrent?"#D4AF37":THEME.crimson):THEME.bgDark, border:`2px solid ${step.done?(isCurrent?"#D4AF37":THEME.crimson):THEME.border}`, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, boxShadow:isCurrent?"0 0 0 5px #D4AF3725":"none", transition:"all 0.3s" }}>
                            {step.done && (isCurrent ? <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:THEME.bgCard }} /> : <svg style={{ width:"11px", height:"11px" }} viewBox="0 0 10 8"><path d="M1 4L3.5 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg>)}
                          </div>
                          {!isLast && <div style={{ position:"absolute", left:"-22px", top:"26px", width:"2px", height:"28px", background:step.done?`${THEME.crimson}50`:THEME.border }} />}
                          <div>
                            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", fontWeight:step.done?700:400, color:step.done?(isCurrent?"#D4AF37":THEME.text):THEME.textLight, display:"flex", alignItems:"center", gap:"8px" }}>
                              {step.label}
                              {isCurrent && <span style={{ fontSize:"10px", fontWeight:600, background:"#D4AF3720", color:"#D4AF37", padding:"2px 8px", borderRadius:"99px" }}>CURRENT</span>}
                            </p>
                            {step.date && <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:isCurrent?"#D4AF37":THEME.textLight, marginTop:"2px" }}>{step.date}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Callouts */}
                {result.status!=="delivered" && result.status!=="cancelled" && (
                  <div style={{ marginTop:"16px", background:"#D4AF3710", border:"1px solid #D4AF3735", borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"center" }}>
                    <span style={{ fontSize:"24px" }}>🚚</span>
                    <div>
                      <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#b8962e", fontSize:"13px" }}>Expected Delivery</p>
                      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>{result.steps?.find(s=>s.label==="Delivered")?.date||"In 5-7 business days"}</p>
                    </div>
                  </div>
                )}
                {result.status==="delivered" && (
                  <div style={{ marginTop:"16px", background:"#d4edda", border:"1px solid #c3e6cb", borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"center" }}>
                    <span style={{ fontSize:"24px" }}>🎉</span>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#155724", fontSize:"13px" }}>Order Delivered! We hope you love your Nouveau™ purchase!</p>
                  </div>
                )}
                {result.status==="cancelled" && (
                  <div style={{ marginTop:"16px", background:`${THEME.crimson}10`, border:`1px solid ${THEME.crimson}30`, borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"center" }}>
                    <span style={{ fontSize:"24px" }}>❌</span>
                    <div>
                      <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:THEME.crimson, fontSize:"13px" }}>Order Cancelled</p>
                      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>Refund will be processed in 5-7 business days.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!result && !notFound && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"16px" }}>
                {[["📦","Order Placed","Confirmed within 1-2 hours"],["⚙️","Processing","Prepared & quality checked"],["🚀","Shipped","Live tracking with courier"],["🏠","Delivered","At your doorstep in 5-7 days"]].map(([icon,title,desc]) => (
                  <div key={title} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"24px 16px", textAlign:"center", transition:"all 0.3s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=THEME.crimson}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=THEME.border}
                  >
                    <div style={{ fontSize:"32px", marginBottom:"12px" }}>{icon}</div>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"13px", color:THEME.text, marginBottom:"6px" }}>{title}</p>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textMuted, lineHeight:1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
