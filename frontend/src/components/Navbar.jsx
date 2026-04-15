import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import Icons from "./Icons";

const GOLD = "#C9A227";
const CRIMSON = "#B71C1C";

export default function Navbar({ page, setPage }) {
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { isAuthenticated, user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const isAdmin = isAuthenticated && user?.role === "admin";

  const desktopLinks = isAdmin
    ? ["Home", "Shop", "About", "Contact", "Admin"]
    : ["Home", "Shop", "About", "Contact"];

  const mobileLinks = isAdmin
    ? ["Home", "Shop", "About", "Contact", "Admin", "Wishlist", "Cart"]
    : ["Home", "Shop", "About", "Contact", "Wishlist", "Cart"];

  return (
    <>
      <style>{`
        .nav-link {
          color: ${THEME.textMuted};
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          transition: color 0.25s;
          padding: 4px 0;
          position: relative;
          cursor: pointer;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 2px;
          background: ${CRIMSON};
          transition: width 0.3s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }
        .nav-link:hover,
        .nav-link.active {
          color: ${CRIMSON};
        }
        .icon-btn-nav {
          background: none;
          border: none;
          cursor: pointer;
          color: ${THEME.textMuted};
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.25s;
          position: relative;
        }
        .icon-btn-nav:hover {
          color: ${CRIMSON};
        }
        .nav-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: ${CRIMSON};
          color: #fff;
          border-radius: 50%;
          width: 17px;
          height: 17px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
        }
        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          <div
            onClick={() => setPage("Home")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div style={{ width: "40px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src="/nouveau-logo.png" alt="Nouveau" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "21px", letterSpacing: "3px", lineHeight: 1, fontWeight: 700, color: CRIMSON }}>nouveau™</div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "7px", letterSpacing: "4px", color: THEME.textLight, marginTop: "2px", textTransform: "uppercase" }}>Own Your Aura</div>
            </div>
          </div>

          <div className="desktop-nav" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {desktopLinks.map((label) => (
              <span key={label} onClick={() => setPage(label)} className={`nav-link${page === label ? " active" : ""}`}>
                {label}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <button className="icon-btn-nav" onClick={() => setSearchOpen((value) => !value)}>
              <Icons.Search />
            </button>
            <button className="icon-btn-nav" onClick={() => setPage(isAuthenticated ? "Account" : "Auth")}>
              <Icons.User />
            </button>
            <button className="icon-btn-nav" onClick={() => setPage("Wishlist")} style={{ position: "relative" }}>
              <Icons.Heart />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
            </button>
            <button className="icon-btn-nav" onClick={() => setPage("Cart")} style={{ position: "relative" }}>
              <Icons.Cart />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </button>
            <button className="mobile-menu-btn icon-btn-nav" onClick={() => setMenuOpen(true)}>
              <Icons.Menu />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div style={{ background: "#fff", borderTop: `1px solid ${THEME.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 32px", display: "flex", gap: "12px" }}>
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage("Shop"), setSearchOpen(false))}
                placeholder="Search kurtas, sarees, lehengas..."
                style={{ flex: 1, background: THEME.bgDark, border: `1.5px solid ${THEME.border}`, color: THEME.text, padding: "13px 18px", fontSize: "14px", borderRadius: "12px" }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = THEME.border)}
              />
              <button onClick={() => { setPage("Shop"); setSearchOpen(false); }} style={{ background: CRIMSON, color: "#fff", border: "none", padding: "13px 24px", borderRadius: "12px", fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", fontWeight: 700 }}>
                SEARCH
              </button>
              <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", color: THEME.textMuted, fontSize: "20px", padding: "0 8px" }}>✕</button>
            </div>
            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 32px 16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "3px", color: THEME.textLight, textTransform: "uppercase" }}>Trending:</span>
              {["Lehenga", "Silk Saree", "Kurta", "Anarkali", "Blazer", "Co-Ord Set"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setPage("Shop"); setSearchOpen(false); }}
                  style={{ background: THEME.bgDark, border: `1px solid ${THEME.border}`, color: THEME.textMuted, padding: "5px 14px", borderRadius: "99px", fontFamily: "'Poppins',sans-serif", fontSize: "11px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${GOLD}18`;
                    e.currentTarget.style.borderColor = GOLD;
                    e.currentTarget.style.color = GOLD;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = THEME.bgDark;
                    e.currentTarget.style.borderColor = THEME.border;
                    e.currentTarget.style.color = THEME.textMuted;
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.99)",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s ease",
        }}
      >
        <button
          style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: THEME.textMuted, cursor: "pointer", fontSize: "24px" }}
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <img src="/nouveau-logo.png" alt="Nouveau" style={{ width: "56px", height: "72px", objectFit: "contain" }} />
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "26px", color: CRIMSON, fontWeight: 700, letterSpacing: "3px" }}>nouveau™</span>
        </div>

        {mobileLinks.map((label) => (
          <span
            key={label}
            onClick={() => {
              setPage(label);
              setMenuOpen(false);
            }}
            style={{ color: THEME.text, fontSize: "20px", letterSpacing: "5px", textTransform: "uppercase", fontFamily: "'Poppins',sans-serif", fontWeight: 300, cursor: "pointer" }}
            onMouseEnter={(e) => (e.target.style.color = CRIMSON)}
            onMouseLeave={(e) => (e.target.style.color = THEME.text)}
          >
            {label}
          </span>
        ))}

        <button
          onClick={() => {
            setPage(isAuthenticated ? "Account" : "Auth");
            setMenuOpen(false);
          }}
          style={{ marginTop: "8px", padding: "13px 36px", background: CRIMSON, color: "#fff", border: "none", borderRadius: "99px", fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "2px", fontWeight: 700 }}
        >
          {isAuthenticated ? "MY ACCOUNT" : "LOGIN / SIGN UP"}
        </button>
      </div>
    </>
  );
}
