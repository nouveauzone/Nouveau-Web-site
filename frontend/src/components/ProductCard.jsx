import { memo, useContext, useMemo } from "react";
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

function ProductCard({ product, setPage, setSelectedProduct }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch } = useContext(CartContext);

  const wished = wishlist.some((item) => item._id === product._id);
  const safeStock = Number(product.stock) || 0;
  const isOutOfStock = safeStock <= 0;

  const { title, subtitle, category, image, price, originalPrice, rating, reviewCount, hasDiscount } = useMemo(() => {
    const nextTitle = safeText(product.title, "Nouveau Signature Piece");
    const nextSubtitle = safeText(product.subcategory, "Womenswear");
    const nextCategory = safeText(product.category, "Nouveau Collection");
    const nextImage = resolveImageUrl(product.images?.[0], "/ethnic1.jpeg");
    const nextPrice = Number(product.price) || 0;
    const nextOriginalPrice = Number(product.originalPrice) || nextPrice;
    const nextRating = Number(product.rating) || 0;
    const nextReviewCount = Array.isArray(product.reviews) ? product.reviews.length : Number(product.reviews) || 0;

    return {
      title: nextTitle,
      subtitle: nextSubtitle,
      category: nextCategory,
      image: nextImage,
      price: nextPrice,
      originalPrice: nextOriginalPrice,
      rating: nextRating,
      reviewCount: nextReviewCount,
      hasDiscount: nextOriginalPrice > nextPrice,
    };
  }, [product]);

  const goToProduct = () => {
    setSelectedProduct(product);
    setPage("Product");
  };

  const addToCart = () => {
    if (isOutOfStock) return;
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

        {isOutOfStock && <span className="sf-out-stock">Out of Stock</span>}
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
        <p className="sf-product-cat">{category}</p>
        <StarRating rating={rating} count={reviewCount} />

        <h3 className="sf-product-title" onClick={goToProduct}>{title}</h3>
        <p className="sf-product-sub">{subtitle}</p>

        <div className="sf-product-price">
          <span className="sf-product-price-current">Rs {price.toLocaleString("en-IN")}</span>
          {hasDiscount && <span className="sf-product-price-original">Rs {originalPrice.toLocaleString("en-IN")}</span>}
        </div>

        <div className="sf-product-actions">
          <button type="button" className="sf-btn" onClick={goToProduct}>View</button>
          <button type="button" className="sf-btn sf-btn-primary" onClick={addToCart} disabled={isOutOfStock} style={isOutOfStock ? { opacity: 0.55, cursor: "not-allowed" } : {}}>{isOutOfStock ? "Out of Stock" : "Quick Add"}</button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
