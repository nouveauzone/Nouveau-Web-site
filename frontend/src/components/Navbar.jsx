import { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";
import Icons from "./Icons";

export default function Navbar({ page, setPage }) {
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const safeCart = Array.isArray(cart) ? cart : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const cartCount = useMemo(() => safeCart.reduce((sum, item) => sum + Number(item?.qty || 0), 0), [safeCart]);
  const isAdmin = isAuthenticated && user?.role === "admin";

  const desktopLinks = isAdmin
    ? ["Home", "Shop", "About", "Contact", "Admin"]
    : ["Home", "Shop", "About", "Contact"];

  const mobileLinks = isAdmin
    ? ["Home", "Shop", "About", "Contact", "Admin", "Wishlist", "Cart"]
    : ["Home", "Shop", "About", "Contact", "Wishlist", "Cart"];

  const openShop = () => {
    setPage("Shop");
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="sf-navbar" aria-label="Main navigation">
        <div className="sf-container sf-navbar-inner">
          <button type="button" className="sf-logo" onClick={() => setPage("Home")}>
            <img src="/nouveau-logo.png" alt="Nouveau" className="sf-logo-mark" />
            <span
              className="sf-logo-word"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1px",
                fontFamily: "'Playfair Display',serif",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "2px",
                color: "#1A1A1A",
              }}
            >
              nouveau<span style={{ color: "#C9A227" }}>™</span>
            </span>
          </button>

          <div className="sf-nav-links">
            {desktopLinks.map((label) => (
              <button
                key={label}
                type="button"
                className={`sf-nav-link ${page === label ? "active" : ""}`}
                onClick={() => setPage(label)}>
                {label}
              </button>
            ))}
          </div>

          <div className="sf-search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") openShop();
              }}
              className="sf-search"
              placeholder="Search products"
              aria-label="Search products"
            />
          </div>

          <div className="sf-nav-actions">
            <button type="button" className="sf-icon-btn" onClick={openShop} aria-label="Open shop search">
              <Icons.Search />
            </button>

            <button
              type="button"
              className="sf-icon-btn"
              onClick={() => setPage(isAuthenticated ? "Account" : "Auth")}
              aria-label="Open account">
              <Icons.User />
            </button>

            <button type="button" className="sf-icon-btn" onClick={() => setPage("Wishlist")} aria-label="Open wishlist">
              <Icons.Heart />
              {safeWishlist.length > 0 && <span className="sf-badge">{safeWishlist.length}</span>}
            </button>

            <button type="button" className="sf-icon-btn" onClick={() => setPage("Cart")} aria-label="Open cart">
              <Icons.Cart />
              {cartCount > 0 && <span className="sf-badge">{cartCount}</span>}
            </button>

            <button type="button" className="sf-icon-btn sf-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Icons.Menu />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="sf-mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="sf-mobile-menu-panel">
            <div className="sf-mobile-top">
              <strong className="sf-logo-word">Menu</strong>
              <button type="button" className="sf-icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <Icons.X />
              </button>
            </div>

            {mobileLinks.map((label) => (
              <button
                key={label}
                type="button"
                className="sf-mobile-nav-btn"
                onClick={() => {
                  setPage(label);
                  setMenuOpen(false);
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
