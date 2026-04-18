import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../data/constants";
import { PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import Icons from "../components/Icons";
import OrnamentDivider from "../components/OrnamentDivider";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import { THEME } from "../styles/theme";
import apiService from "../services/apiService";

const normalizeProduct = (product) => ({
  ...product,
  images: Array.isArray(product?.images) && product.images.length ? product.images : ["/ethnic1.jpeg"],
});

const LOCAL_FALLBACK_PRODUCTS = PRODUCTS.map(normalizeProduct);

const SKELETON_COUNT = 8;

export default function ShopPage({ setPage, setSelectedProduct, initialCategory }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [priceMax, setPriceMax] = useState(20000);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await apiService.getProducts({ limit: 100 });

      if (Array.isArray(data)) {
        setProducts(data.map(normalizeProduct));
        return;
      }

      if (Array.isArray(data?.products)) {
        setProducts(data.products.map(normalizeProduct));
        return;
      }

      throw new Error("Unexpected product response");
    } catch {
      setIsError(true);
      setProducts(LOCAL_FALLBACK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(() => {
    let result = [...products];

    result = result.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      return Number(item.price) <= priceMax;
    });

    if (sortBy === "price-asc") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price-desc") result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "rating") result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    if (sortBy === "newest") result = result.filter((item) => item.isNew);

    return result;
  }, [products, activeCategory, priceMax, sortBy]);

  const clearFilters = useCallback(() => {
    setActiveCategory("All");
    setPriceMax(20000);
    setSortBy("featured");
  }, []);

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <section style={{ background: THEME.bgCard, borderBottom: `1px solid ${THEME.border}` }}>
        <div className="sf-container" style={{ paddingTop: "clamp(32px, 6vw, 56px)", paddingBottom: "clamp(24px, 4vw, 36px)" }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "6px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>
            Curated Collections
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 700, textAlign: "center" }}>
            Shop Womenswear
          </h1>
          <OrnamentDivider />
          <p style={{ fontFamily: "'Poppins',sans-serif", color: THEME.textMuted, textAlign: "center", maxWidth: "620px", margin: "0 auto", lineHeight: 1.75, fontSize: "14px" }}>
            Premium everyday styles with clean tailoring and elevated fabrics, inspired by the same design language as Nouveau Home.
          </p>

          <div className="sf-filter-row" role="tablist" aria-label="Category filters" style={{ justifyContent: "center", marginTop: "22px" }}>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={`sf-pill ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}>
                {category}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "16px", display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.textLight, textTransform: "uppercase", marginBottom: "6px" }}>
                Max Price: Rs {priceMax.toLocaleString("en-IN")}
              </p>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <select className="sf-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="sf-container" style={{ paddingTop: "clamp(28px, 5vw, 44px)", paddingBottom: "clamp(48px, 8vw, 76px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap", marginBottom: "18px" }}>
          <p className="sf-results">{visibleProducts.length} products</p>
          <BtnOutline onClick={clearFilters} color={THEME.crimson} style={{ padding: "10px 18px", fontSize: "10px" }}>
            Reset Filters <Icons.X />
          </BtnOutline>
        </div>

        {isError && !isLoading && (
          <div className="sf-state" style={{ marginBottom: "18px" }}>
            <h3>Could not sync latest products</h3>
            <p>Showing curated catalog fallback. Check API and retry for live inventory.</p>
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
              <BtnPrimary onClick={loadProducts}>Retry API</BtnPrimary>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="sf-products-grid" aria-live="polite" aria-label="Loading products">
            {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
              <div className="sf-skeleton-card" key={`skeleton-${idx}`}>
                <div className="sf-skeleton-media" />
                <div className="sf-skeleton-lines">
                  <div className="sf-skeleton-line" />
                  <div className="sf-skeleton-line" style={{ width: "70%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && visibleProducts.length === 0 && (
          <div className="sf-state">
            <h3>No products found</h3>
            <p>Try resetting category or increasing the max price filter.</p>
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
              <BtnOutline onClick={clearFilters} color={THEME.crimson}>Clear Filters</BtnOutline>
            </div>
          </div>
        )}

        {!isLoading && visibleProducts.length > 0 && (
          <div className="sf-products-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id || product.title} product={product} setPage={setPage} setSelectedProduct={setSelectedProduct} />
            ))}
          </div>
        )}
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}
