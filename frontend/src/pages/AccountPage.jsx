import { useContext, useState, useEffect } from "react";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { AppDataContext, ToastContext } from "../context/Providers";
import { THEME } from "../styles/theme";
import { BtnPrimary, BtnOutline } from "../components/Buttons";
import API from "../services/apiService";
import { getImageUrl } from "../utils/imageUrl";

const STATUS_STYLE = {
  pending:    { bg:"#fff3cd", color:"#856404" },
  processing: { bg:"#cce5ff", color:"#004085" },
  shipped:    { bg:"#d4edda", color:"#155724" },
  delivered:  { bg:"#d1ecf1", color:"#0c5460" },
  cancelled:  { bg:"#f8d7da", color:"#721c24" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status?.toLowerCase()] || { bg:"#eee", color:"#333" };
  return (
    <span style={{ background:s.bg, color:s.color, padding:"4px 14px", borderRadius:"99px", fontSize:"11px", fontFamily:"'Poppins',sans-serif", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", whiteSpace:"nowrap" }}>{status}</span>
  );
}

export default function AccountPage({ setPage }) {
  const { user, dispatch } = useContext(AuthContext);
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch }   = useContext(CartContext);
  const { myOrders, refreshMyOrders, allOrders } = useContext(AppDataContext);
  const toast = useContext(ToastContext);

  const [tab, setTab] = useState("orders");

  // ── Profile edit ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ name:user?.name||"", phone:user?.phone||"", password:"", confirmPass:"" });
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Addresses ─────────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label:"Home", street:"", city:"", state:"", pincode:"", isDefault:false });
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => { if (tab==="orders") refreshMyOrders(); }, [tab, refreshMyOrders]);
  useEffect(() => { setAddresses(user?.addresses || []); }, [user]);

  // ── Profile update ─────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (profileForm.password && profileForm.password !== profileForm.confirmPass) {
      toast("Passwords do not match", "error"); return;
    }
    if (profileForm.password && profileForm.password.length < 6) {
      toast("Password must be 6+ characters", "error"); return;
    }
    setProfileLoading(true);
    try {
      const payload = { name:profileForm.name, phone:profileForm.phone };
      if (profileForm.password) payload.password = profileForm.password;
      const updated = await API.updateProfile(payload);
      dispatch({ type:"UPDATE", payload:updated });
      toast("Profile updated successfully! ✅");
      setProfileForm(f => ({...f, password:"", confirmPass:""}));
    } catch (err) { toast(err.message, "error"); }
    finally { setProfileLoading(false); }
  };

  // ── Add address ───────────────────────────────────────────────────────────
  const handleAddAddress = async () => {
    if (!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      toast("Please fill all address fields", "error"); return;
    }
    setAddrLoading(true);
    try {
      const updatedAddrs = await API.addAddress(addrForm);
      setAddresses(updatedAddrs);
      dispatch({ type:"UPDATE", payload:{ addresses:updatedAddrs } });
      setShowAddrForm(false);
      setAddrForm({ label:"Home", street:"", city:"", state:"", pincode:"", isDefault:false });
      toast("Address added! 📍");
    } catch (err) { toast(err.message, "error"); }
    finally { setAddrLoading(false); }
  };

  // ── Delete address ────────────────────────────────────────────────────────
  const handleDeleteAddress = async (id) => {
    try {
      const updatedAddrs = await API.deleteAddress(id);
      setAddresses(updatedAddrs);
      dispatch({ type:"UPDATE", payload:{ addresses:updatedAddrs } });
      toast("Address removed");
    } catch (err) { toast(err.message, "error"); }
  };

  const fStyle = { width:"100%", background:THEME.bg, border:`1px solid ${THEME.border}`, color:THEME.text, padding:"12px 14px", fontSize:"14px", outline:"none", fontFamily:"'Poppins',sans-serif", borderRadius:"10px" };
  // Use myOrders from context — single source of truth, already filtered by userId/email.
  const visibleOrders = myOrders;

  const tabs = ["orders","wishlist","addresses","profile"];

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${THEME.crimson},${THEME.crimsonDark})`, padding:"56px 40px 44px" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"5px", color:THEME.gold, marginBottom:"8px" }}>MY ACCOUNT</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,42px)", color:"#fff" }}>
              Welcome, <em>{user?.name?.split(" ")[0]}</em> 🪷
            </h1>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:"rgba(255,255,255,0.55)", marginTop:"6px" }}>{user?.email}</p>
          </div>
          <button onClick={() => { dispatch({ type:"LOGOUT" }); toast("Logged out"); setPage("Home"); }}
            style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.85)", padding:"11px 20px", cursor:"pointer", fontSize:"11px", letterSpacing:"2px", fontFamily:"'Poppins',sans-serif", borderRadius:"10px", fontWeight:600, transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>
            ← LOGOUT
          </button>
        </div>
      </div>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 40px 60px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${THEME.border}`, marginBottom:"36px", overflowX:"auto" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:"16px 24px", background:"none", border:"none", color:tab===t?THEME.crimson:THEME.textMuted, borderBottom:tab===t?`2px solid ${THEME.crimson}`:"2px solid transparent", cursor:"pointer", fontSize:"11px", letterSpacing:"2px", textTransform:"capitalize", fontFamily:"'Poppins',sans-serif", fontWeight:700, transition:"all 0.2s", whiteSpace:"nowrap" }}>
              {t === "orders" ? `My Orders (${visibleOrders.length})` : t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ─────────────────────────────────────────────────── */}
        {tab==="orders" && (
          <div>
            {visibleOrders.length === 0 ? (
              <div style={{ textAlign:"center", padding:"72px 0" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}>📦</div>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:THEME.textMuted, marginBottom:"8px" }}>No orders yet</p>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textLight, marginBottom:"28px" }}>Your order history will appear here</p>
                <BtnPrimary onClick={() => setPage("Shop")} style={{ borderRadius:"99px" }}>Start Shopping 🛍️</BtnPrimary>
              </div>
            ) : visibleOrders.map(o => (
              <div key={o._id} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"24px 28px", marginBottom:"14px", borderLeft:`3px solid ${THEME.crimson}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"12px", marginBottom:"14px" }}>
                  <div>
                    <p style={{ fontFamily:"'Poppins',sans-serif", color:THEME.crimson, fontSize:"13px", fontWeight:700, letterSpacing:"1px" }}>#{o._id}</p>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textLight, marginTop:"3px" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                      {" · "}{o.items?.length} item{o.items?.length!==1?"s":""}
                    </p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <StatusBadge status={o.orderStatus||"pending"} />
                    <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"17px", color:THEME.text }}>₹{o.total?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                {/* Items preview */}
                <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"14px" }}>
                  {o.items?.slice(0,3).map((item,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", background:THEME.bgDark, borderRadius:"8px", padding:"8px 12px" }}>
                      <img src={getImageUrl(item.image, "/product1.jpeg")} alt={item.title} style={{ width:"36px", height:"44px", objectFit:"cover", borderRadius:"5px" }} onError={e=>e.target.src="/product1.jpeg"} />
                      <div>
                        <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.text, fontWeight:600, maxWidth:"140px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</p>
                        <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textLight }}>Size: {item.size} · ×{item.qty}</p>
                      </div>
                    </div>
                  ))}
                  {o.items?.length > 3 && <div style={{ display:"flex", alignItems:"center", padding:"8px 12px", color:THEME.textLight, fontFamily:"'Poppins',sans-serif", fontSize:"12px" }}>+{o.items.length-3} more</div>}
                </div>
                {/* Track button */}
                <button onClick={() => setPage("TrackOrder")}
                  style={{ background:"none", border:`1px solid ${THEME.crimson}`, color:THEME.crimson, padding:"8px 20px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"1px" }}>
                  🚚 Track Order
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── WISHLIST TAB ──────────────────────────────────────────────────── */}
        {tab==="wishlist" && (
          wishlist.length===0 ? (
            <div style={{ textAlign:"center", padding:"72px 0" }}>
              <div style={{ fontSize:"56px", marginBottom:"16px" }}>❤️</div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:THEME.textMuted, marginBottom:"24px" }}>Your wishlist is empty</p>
              <BtnPrimary onClick={() => setPage("Shop")} style={{ borderRadius:"99px" }}>Explore Collection</BtnPrimary>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"20px" }}>
              {wishlist.map(p => (
                <div key={p._id} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", overflow:"hidden" }}>
                  <div style={{ position:"relative" }}>
                    <img src={getImageUrl(p.images?.[0], "/product1.jpeg")} alt={p.title} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }} onError={e=>e.target.src="/product1.jpeg"} />
                    <button onClick={() => { toggleWishlist(p); toast("Removed from wishlist"); }}
                      style={{ position:"absolute", top:"10px", right:"10px", background:THEME.crimson, border:"none", color:"#fff", cursor:"pointer", padding:"8px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      ❤️
                    </button>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", marginBottom:"6px", color:THEME.text }}>{p.title}</p>
                    <p style={{ fontFamily:"'Poppins',sans-serif", color:THEME.crimson, fontWeight:700, marginBottom:"12px" }}>₹{p.price?.toLocaleString("en-IN")}</p>
                    <BtnPrimary onClick={() => { cartDispatch({ type:"ADD", item:{...p,size:p.sizes[0]} }); }} style={{ width:"100%", justifyContent:"center", padding:"10px", borderRadius:"10px", fontSize:"11px" }}>
                      Add to Cart
                    </BtnPrimary>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── ADDRESSES TAB ─────────────────────────────────────────────────── */}
        {tab==="addresses" && (
          <div style={{ maxWidth:"680px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px" }}>Saved Addresses</h2>
              <BtnPrimary onClick={() => setShowAddrForm(!showAddrForm)} style={{ borderRadius:"10px", padding:"10px 20px", fontSize:"11px" }}>
                {showAddrForm ? "✕ Cancel" : "+ Add Address"}
              </BtnPrimary>
            </div>

            {/* Add form */}
            {showAddrForm && (
              <div style={{ background:THEME.bgCard, border:`1.5px solid ${THEME.crimson}40`, borderRadius:"14px", padding:"28px", marginBottom:"24px" }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", marginBottom:"20px" }}>New Address</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                  {[["label","Label (Home/Work/Other)","text",false],["street","Street Address","text",true],["city","City","text",false],["state","State","text",false],["pincode","PIN Code","text",false]].map(([k,lbl,type,full]) => (
                    <div key={k} style={{ gridColumn:full?"1/-1":"auto" }}>
                      <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, display:"block", marginBottom:"6px", fontWeight:700 }}>{lbl.toUpperCase()}</label>
                      <input type={type} value={addrForm[k]} onChange={e=>setAddrForm(f=>({...f,[k]:e.target.value}))} style={fStyle} />
                    </div>
                  ))}
                  <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:"10px" }}>
                    <input type="checkbox" id="defaultAddr" checked={addrForm.isDefault} onChange={e=>setAddrForm(f=>({...f,isDefault:e.target.checked}))} style={{ accentColor:THEME.crimson, width:"16px", height:"16px" }} />
                    <label htmlFor="defaultAddr" style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.text, cursor:"pointer" }}>Set as default address</label>
                  </div>
                </div>
                <div style={{ marginTop:"20px" }}>
                  <BtnPrimary onClick={handleAddAddress} disabled={addrLoading} style={{ borderRadius:"10px" }}>
                    {addrLoading ? "Saving..." : "Save Address 📍"}
                  </BtnPrimary>
                </div>
              </div>
            )}

            {/* Address list */}
            {addresses.length===0 ? (
              <div style={{ textAlign:"center", padding:"48px", background:THEME.bgCard, borderRadius:"14px", border:`1px solid ${THEME.border}` }}>
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>📍</div>
                <p style={{ fontFamily:"'Poppins',sans-serif", color:THEME.textMuted }}>No saved addresses yet</p>
              </div>
            ) : addresses.map(addr => (
              <div key={addr._id} style={{ background:THEME.bgCard, border:`1px solid ${addr.isDefault?THEME.crimson:THEME.border}`, borderRadius:"14px", padding:"20px 24px", marginBottom:"12px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"16px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                    <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", letterSpacing:"2px", color:THEME.crimson, fontWeight:700 }}>📍 {addr.label?.toUpperCase()}</span>
                    {addr.isDefault && <span style={{ background:`${THEME.gold}20`, color:THEME.goldDark, fontSize:"10px", padding:"2px 10px", borderRadius:"99px", fontFamily:"'Poppins',sans-serif", fontWeight:700 }}>DEFAULT</span>}
                  </div>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.text, lineHeight:1.7 }}>
                    {addr.street}<br />{addr.city}, {addr.state} – {addr.pincode}
                  </p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)}
                  style={{ background:`${THEME.crimson}10`, border:`1px solid ${THEME.crimson}30`, color:THEME.crimson, padding:"8px 14px", borderRadius:"8px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:600, whiteSpace:"nowrap" }}>
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE TAB ───────────────────────────────────────────────────── */}
        {tab==="profile" && (
          <div style={{ maxWidth:"520px" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", marginBottom:"24px" }}>Edit Profile</h2>

            {/* Avatar circle */}
            <div style={{ display:"flex", alignItems:"center", gap:"20px", marginBottom:"32px" }}>
              <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:`linear-gradient(135deg, ${THEME.crimson}, ${THEME.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", color:"#fff", fontFamily:"'Playfair Display',serif", fontWeight:700, flexShrink:0 }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:THEME.text, fontWeight:700 }}>{user?.name}</p>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textLight }}>{user?.email} · Member since 2026</p>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {[["name","Full Name","text",profileForm.name],["phone","Phone Number","tel",profileForm.phone]].map(([k,lbl,type,val]) => (
                <div key={k}>
                  <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, display:"block", marginBottom:"7px", fontWeight:700 }}>{lbl.toUpperCase()}</label>
                  <input type={type} value={val} onChange={e=>setProfileForm(f=>({...f,[k]:e.target.value}))} style={fStyle} />
                </div>
              ))}

              <div style={{ borderTop:`1px solid ${THEME.border}`, paddingTop:"20px", marginTop:"4px" }}>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", letterSpacing:"2px", color:THEME.textLight, marginBottom:"14px" }}>CHANGE PASSWORD (leave blank to keep current)</p>
                {[["password","New Password"],["confirmPass","Confirm New Password"]].map(([k,lbl]) => (
                  <div key={k} style={{ marginBottom:"14px" }}>
                    <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, display:"block", marginBottom:"7px", fontWeight:700 }}>{lbl.toUpperCase()}</label>
                    <input type="password" value={profileForm[k]} onChange={e=>setProfileForm(f=>({...f,[k]:e.target.value}))} style={fStyle} placeholder="Min 6 characters" />
                  </div>
                ))}
              </div>

              <BtnPrimary onClick={handleProfileSave} disabled={profileLoading} style={{ borderRadius:"12px", width:"100%", justifyContent:"center" }}>
                {profileLoading ? "Saving..." : "Save Changes ✅"}
              </BtnPrimary>
            </div>
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
