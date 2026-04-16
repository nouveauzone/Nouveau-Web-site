import { useContext, useState } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { THEME } from "../styles/theme";
import Icons from "./Icons";
import StarRating from "./StarRating";
import { resolveImageUrl } from "../utils/imageUrl";

const CATEGORY_MAP = {
  "Indian Ethnic Wear": "ETHNIC",
  "Indian Premium Western Wear": "WESTERN",
};

const BAD_TEXT_RE = /(\/static\/media|\.(jpeg|jpg|png|webp|svg)$|\.[a-f0-9]{8,}$|^https?:\/\/|\\)/i;

const normalizeText = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || BAD_TEXT_RE.test(raw)) return fallback;
  if (raw.length > 60) return fallback;
  return raw;
};

export default function ProductCard({ product, setPage, setSelectedProduct, compact = false }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch } = useContext(CartContext);
  const [hov, setHov] = useState(false);
  const wished = wishlist.some((w) => w._id === product._id);
  const primaryImage = resolveImageUrl(product.images?.[0], "/ethnic1.jpeg");
  const title = normalizeText(product.title, "Nouveau Signature Piece");
  const categoryLabel = CATEGORY_MAP[product.category] || "NOUVEAU EDIT";
  const subtitle = normalizeText(product.subcategory, "Women's Wear");
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;
  const discount = Number(product.discount) || 0;
  const rating = Number(product.rating) || 0;
  const reviewCount = Array.isArray(product.reviews) ? product.reviews.length : Number(product.reviews) || 0;
  const hasDiscount = originalPrice > price && discount > 0;

  const goToProduct = () => {
    setSelectedProduct(product);
    setPage("Product");
  };

  const addToCart = (e) => {
    e.stopPropagation();
    cartDispatch({ type: "ADD", item: { ...product, size: product.sizes?.[0] || "Free Size" } });
  };

  const actionBtnBase = {
    padding: compact ? "12px 10px" : "14px 12px",
    fontSize: "10px",
    letterSpacing: "1.4px",
    cursor: "pointer",
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 700,
    borderRadius: "9px",
    textTransform: "uppercase",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: THEME.bgCard,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${hov ? THEME.crimsonLight : THEME.border}`,
        borderRadius: compact ? "12px" : "14px",
        boxShadow: hov ? "0 14px 30px rgba(26, 26, 26, 0.12)" : "0 4px 14px rgba(26, 26, 26, 0.06)",
        transition: "all 0.28s ease",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
      }}>

      <div style={{ position: "relative", overflow: "hidden" }} onClick={goToProduct}>
        <img
          src={primaryImage} alt={product.title}
          style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block", transition: "transform 0.45s ease", transform: hov ? "scale(1.03)" : "scale(1)" }}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/ethnic1.jpeg"; }}
          loading="lazy" />

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26, 26, 26, 0.24) 0%, rgba(26, 26, 26, 0.02) 55%, transparent 100%)", opacity: hov ? 1 : 0.86, transition: "opacity 0.25s" }} />

        <div style={{ position: "absolute", inset: "16px 16px auto 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.94)", color: THEME.text, fontSize: "9px", letterSpacing: "1.6px", padding: "5px 10px", fontFamily: "'Poppins', sans-serif", fontWeight: 700, borderRadius: "999px" }}>
              {categoryLabel}
            </span>
            {product.isNew && (
              <span style={{ background: THEME.crimson, color: "#fff", fontSize: "9px", letterSpacing: "1.6px", padding: "5px 10px", fontFamily: "'Poppins', sans-serif", fontWeight: 700, borderRadius: "999px" }}>
                NEW
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            aria-label="Toggle wishlist"
            style={{
              background: wished ? THEME.crimson : "rgba(255,255,255,0.94)",
              border: `1px solid ${wished ? THEME.crimson : "rgba(255,255,255,0.94)"}`,
              cursor: "pointer",
              color: wished ? "#fff" : THEME.crimson,
              width: "44px",
              height: "44px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.25s ease",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              minHeight: "44px",
              minWidth: "44px",
            }}>
            <Icons.Heart filled={wished} />
          </button>
        </div>

        {hasDiscount && (
          <div style={{ position: "absolute", top: "16px", right: "58px", background: THEME.gold, color: "#fff", fontSize: "9px", letterSpacing: "1px", padding: "6px 10px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, borderRadius: "999px", boxShadow: "0 5px 12px rgba(201,162,39,0.28)" }}>
            SAVE {discount}%
          </div>
        )}

      </div>

      <div style={{ padding: compact ? "14px" : "18px 18px 16px" }} onClick={goToProduct}>
        <div style={{ minHeight: "18px", marginBottom: "4px" }}>
          {(rating > 0 || reviewCount > 0) ? (
            <StarRating rating={rating} count={reviewCount} />
          ) : (
            <span style={{ visibility: "hidden", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>placeholder</span>
          )}
        </div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: compact ? "15px" : "18px", margin: "8px 0 7px", color: THEME.text, lineHeight: 1.3, minHeight: compact ? "40px" : "46px" }}>
          {title}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", gap: "10px" }}>
          <p style={{ fontSize: "11px", color: THEME.textLight, letterSpacing: "1.2px", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", margin: 0 }}>
            {subtitle}
          </p>
          {product.stock > 0 ? (
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "#2d6a4f", fontWeight: 700, background: "#e8f5eb", padding: "4px 8px", borderRadius: "999px" }}>
              In Stock
            </span>
          ) : (
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: THEME.crimson, fontWeight: 700, background: `${THEME.crimson}12`, padding: "4px 8px", borderRadius: "999px" }}>
              Sold Out
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: THEME.crimson, fontWeight: 700, fontSize: "19px", fontFamily: "'Poppins', sans-serif" }}>
            ₹{price.toLocaleString("en-IN")}
          </span>
          {originalPrice > price && (
            <span style={{ color: THEME.textLight, textDecoration: "line-through", fontSize: "13px" }}>
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: compact ? "0 14px 14px" : "0 18px 16px" }}>
        <style>{`
          @media (max-width: 640px) {
            .product-btn-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        <div className="product-btn-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "10px" }}>
          <button
            onClick={goToProduct}
            style={{
              ...actionBtnBase,
              background: THEME.bg,
              color: THEME.text,
              border: `1px solid ${THEME.border}`,
            }}>
            View
          </button>
          <button
            onClick={addToCart}
            style={{
              ...actionBtnBase,
              background: `linear-gradient(135deg, ${THEME.crimsonDark}, ${THEME.goldDark})`,
              color: "#fff",
              border: "none",
              boxShadow: "0 8px 16px rgba(159,91,101,0.28)",
            }}>
            Add to Cart
          </button>
        </div>
      </div>

      <div style={{ height: "3px", background: `linear-gradient(90deg, ${THEME.crimson} 0%, ${THEME.gold} 100%)`, opacity: 0.7 }} />
    </article>
  );
}
