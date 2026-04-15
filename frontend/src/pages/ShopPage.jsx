import { useState, useEffect } from "react";
import { CATEGORIES } from "../data/constants";
// import { PRODUCTS } from "../data/products"; // replaced with backend
import { THEME } from "../styles/theme";
import ProductCard from "../components/ProductCard";
import NouveauLogo from "../components/Logo";
import Footer from "../components/Footer";
import API from "../config/api";
import { resolveImageUrl } from "../utils/imageUrl";

const normalizeProduct = (product) => ({
  ...product,
  images: Array.isArray(product.images) ? product.images.map((img) => resolveImageUrl(img, "/ethnic1.jpeg")) : ["/ethnic1.jpeg"],
});

export default function ShopPage({ setPage, setSelectedProduct, initialCategory }) {
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadProducts = () => {
    setIsLoading(true);
    setIsError(false);
    // First try localStorage (Admin panel changes)
    try {
      const saved = localStorage.getItem('nouveau_local_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPRODUCTS(parsed.map(normalizeProduct));
          setIsLoading(false);
          return;
        }
      }
    } catch {}
    // Then try backend API
    API.getProducts({ limit: 100 }).then((data) => {
      if (data.products && data.products.length > 0) setPRODUCTS(data.products.map(normalizeProduct));
      else if (Array.isArray(data) && data.length > 0) setPRODUCTS(data.map(normalizeProduct));
      else {
        // Fallback to INITIAL_PRODUCTS
        const { PRODUCTS: IP } = require("../data/products");
        setPRODUCTS(IP.map(normalizeProduct));
      }
    }).catch(err => {
      console.error(err);
      setIsError(true);
      const { PRODUCTS: IP } = require("../data/products");
      setPRODUCTS(IP.map(normalizeProduct));
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();

    const onStorage = (e) => {
      if (e.key === "nouveau_local_products") loadProducts();
    };

    const onFocus = () => loadProducts();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [priceMax, setPriceMax] = useState(20000);
  const [sortBy, setSortBy] = useState("featured");

  let products = PRODUCTS.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (p.price > priceMax) return false;
    return true;
  });

  if (sortBy === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") products = [...products].sort((a, b) => b.rating - a.rating);
  if (sortBy === "newest") products = [...products].filter((p) => p.isNew);

  const ethnicCount = PRODUCTS.filter(p => p.category === "Indian Ethnic Wear").length;
  const westernCount = PRODUCTS.filter(p => p.category === "Indian Premium Western Wear").length;

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${THEME.crimson},${THEME.crimsonDark})`, padding:"72px 40px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:"-60px", bottom:"-60px", opacity:0.06 }}><img src="/nouveau-logo.png" alt="" style={{width:"280px",height:"360px",objectFit:"contain",filter:"brightness(10)",display:"block"}} /></div>
        <div style={{ maxWidth:"1400px", margin:"0 auto", position:"relative", zIndex:1 }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.gold, marginBottom:"10px", textTransform:"uppercase" }}>Women's Wear</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,56px)", fontWeight:700, color:"#fff" }}>
            {activeCategory === "All" ? "All Collections" : activeCategory}
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px", marginTop:"8px", fontFamily:"'Poppins',sans-serif", letterSpacing:"1px" }}>{products.length} products · Women Only</p>
        </div>
      </div>

      {/* Category tabs — only 2 categories */}
      <div style={{ borderBottom:`1px solid ${THEME.border}`, padding:"0 40px", background:THEME.bgCard }}>
        <div style={{ maxWidth:"1400px", margin:"0 auto", display:"flex", overflowX:"auto" }}>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              style={{
                padding:"18px 28px", background:"none", border:"none",
                borderBottom: activeCategory === c ? `3px solid ${THEME.crimson}` : "3px solid transparent",
                color: activeCategory === c ? THEME.crimson : THEME.textMuted,
                cursor:"pointer", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase",
                fontFamily:"'Poppins',sans-serif", fontWeight:600,
                transition:"all 0.2s", whiteSpace:"nowrap",
              }}>
              {c}
              {c !== "All" && (
                <span style={{ marginLeft:"6px", fontSize:"10px", opacity:0.6 }}>
                  ({c === "Indian Ethnic Wear" ? ethnicCount : westernCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category cards */}
      {activeCategory === "All" && (
        <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"40px 40px 0" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"8px" }} className="grid-2col">
            {[
              { cat:"Indian Ethnic Wear", desc:"Kurtas · Sarees · Lehengas · Anarkalis · Sharara · Suits", emoji:"🪷", color:THEME.crimson, count:ethnicCount },
              { cat:"Indian Premium Western Wear", desc:"Dresses · Blazers · Trousers · Jumpsuits · Co-Ords · Tops", emoji:"✨", color:THEME.gold, count:westernCount },
            ].map(({ cat, desc, emoji, color, count }) => (
              <div key={cat} onClick={() => setActiveCategory(cat)}
                style={{ background:THEME.bgCard, border:`1.5px solid ${color}30`, borderRadius:"16px", padding:"28px 32px", cursor:"pointer", display:"flex", alignItems:"center", gap:"20px", transition:"all 0.3s", boxShadow:"0 4px 16px rgba(0,0,0,0.04)" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 32px ${color}20`}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${color}30`;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.04)"}}>
                <div style={{ width:"56px", height:"56px", background:`${color}15`, borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", flexShrink:0 }}>{emoji}</div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700, color:THEME.text, marginBottom:"4px" }}>{cat}</p>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textLight, letterSpacing:"0.5px" }}>{desc}</p>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:color, marginTop:"6px", fontWeight:600 }}>{count} items →</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"40px", display:"flex", gap:"48px" }}>
        {/* Sidebar */}
        <aside style={{ width:"220px", flexShrink:0 }} className="hide-mobile">
          <div style={{ marginBottom:"36px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"3px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"16px", fontWeight:700 }}>Category</p>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", color: activeCategory===c ? THEME.crimson : THEME.textMuted, cursor:"pointer", padding:"8px 0 8px 12px", fontSize:"13px", fontFamily:"'Poppins',sans-serif", fontWeight: activeCategory===c ? 600 : 400, borderLeft: activeCategory===c ? `2px solid ${THEME.crimson}` : "2px solid transparent", transition:"all 0.2s" }}>{c}</button>
            ))}
          </div>

          <div style={{ marginBottom:"36px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"3px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"16px", fontWeight:700 }}>Max Price</p>
            <input type="range" min="1000" max="20000" step="500" value={priceMax}
              onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
              style={{ width:"100%", accentColor:THEME.crimson, cursor:"pointer" }} />
            <div style={{ display:"flex", justifyContent:"space-between", color:THEME.textLight, fontSize:"12px", marginTop:"8px", fontFamily:"'Poppins',sans-serif" }}>
              <span>₹1,000</span><span>₹{priceMax.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background:`${THEME.crimson}08`, border:`1px solid ${THEME.crimson}20`, borderRadius:"10px", padding:"16px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, marginBottom:"8px", fontWeight:700 }}>COUPON CODES</p>
            {[["NOUVEAU10","10% off"],["AURA20","20% off"],["LOTUS15","15% off"]].map(([code,desc]) => (
              <div key={code} style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                <code style={{ fontFamily:"monospace", fontSize:"12px", color:THEME.text, fontWeight:700 }}>{code}</code>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textMuted }}>{desc}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Products grid */}
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.textMuted }}>{products.length} results</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, color:THEME.text, padding:"10px 16px", fontSize:"12px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", outline:"none", letterSpacing:"1px", borderRadius:"10px" }}>
              <option value="featured">Featured</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <section style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"18px", boxShadow:"0 6px 18px rgba(26,26,26,0.05)" }}>
            {isLoading ? (
              <div style={{ textAlign:"center", padding:"80px 0", color:THEME.textMuted }}>Loading products...</div>
            ) : isError ? (
              <div style={{ textAlign:"center", padding:"80px 0", color:THEME.crimson }}>Failed to load products. Please try again.</div>
            ) : products.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 0" }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:THEME.textMuted }}>No products found</p>
                <button onClick={() => { setActiveCategory("All"); setPriceMax(20000); }}
                  style={{ marginTop:"16px", background:"none", border:`1px solid ${THEME.crimson}`, color:THEME.crimson, padding:"10px 24px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"12px" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:"18px" }}>
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
