import { useContext, useMemo } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import Icons from "./Icons";
import StarRating from "./StarRating";
import { resolveImageUrl } from "../utils/imageUrl";

const BAD_TEXT_RE = /(\/static\/media|\.(jpeg|jpg|png|webp|svg)$|\.[a-f0-9]{8,}$|^https?:\/\/|\\)/i;

const safeText = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || BAD_TEXT_RE.test(raw)) return fallback;
  return raw;
};

export default function ProductCard({ product, setPage, setSelectedProduct }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch } = useContext(CartContext);

  const wished = wishlist.some((item) => item._id === product._id);

  const title = safeText(product.title, "Nouveau Signature Piece");
  const subtitle = safeText(product.subcategory, "Womenswear");
  const image = resolveImageUrl(product.images?.[0], "/ethnic1.jpeg");

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;
  const rating = Number(product.rating) || 0;
  const reviewCount = Array.isArray(product.reviews) ? product.reviews.length : Number(product.reviews) || 0;

  const hasDiscount = useMemo(() => originalPrice > price, [originalPrice, price]);

  const goToProduct = () => {
    setSelectedProduct(product);
    setPage("Product");
  };

  const addToCart = () => {
    cartDispatch({ type: "ADD", item: { ...product, size: product.sizes?.[0] || "Free Size" } });
  };

  return (
    <article className="sf-product-card">
      <div className="sf-product-media" onClick={goToProduct} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && goToProduct()}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/ethnic1.jpeg";
          }}
        />

        <button
          type="button"
          className="sf-wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Toggle wishlist">
          <Icons.Heart filled={wished} />
        </button>
      </div>

      <div className="sf-product-body">
        {(rating > 0 || reviewCount > 0) && <StarRating rating={rating} count={reviewCount} />}

        <h3 className="sf-product-title" onClick={goToProduct}>{title}</h3>
        <p className="sf-product-sub">{subtitle}</p>

        <div className="sf-product-price">
          <span className="sf-product-price-current">Rs {price.toLocaleString("en-IN")}</span>
          {hasDiscount && <span className="sf-product-price-original">Rs {originalPrice.toLocaleString("en-IN")}</span>}
        </div>

        <div className="sf-product-actions">
          <button type="button" className="sf-btn" onClick={goToProduct}>View</button>
          <button type="button" className="sf-btn sf-btn-primary" onClick={addToCart}>Quick Add</button>
        </div>
      </div>
    </article>
  );
}
