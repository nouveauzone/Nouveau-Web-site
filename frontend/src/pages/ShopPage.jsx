import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { CATEGORIES } from "../data/constants";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Icons from "../components/Icons";
import apiService from "../services/apiService";
import API_BASE from "../config/api";

const normalizeProduct = (product) => ({
  ...product,
  images: product.images,
});

const SKELETON_COUNT = 8;

export default function ShopPage({ setPage, setSelectedProduct, initialCategory }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [priceMax, setPriceMax] = useState(20000);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    setIsError(false);

    apiService.getProducts({ limit: 100 })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.map(normalizeProduct));
          return;
        }

        if (Array.isArray(data?.products)) {
          setProducts(data.products.map(normalizeProduct));
          return;
        }

        setProducts([]);
      })
      .catch(() => {
        setIsError(true);
        setProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const socketUrl = API_BASE || (typeof window !== "undefined" ? window.location.origin : "");
    const socket = io(socketUrl, { transports: ["websocket", "polling"], withCredentials: true });

    const intervalId = setInterval(() => {
      loadProducts();
    }, 5000);

    const onFocus = () => loadProducts();

    loadProducts();
    socket.on("productUpdated", loadProducts);
    window.addEventListener("focus", onFocus);

    return () => {
      socket.off("productUpdated", loadProducts);
      socket.disconnect();
      window.removeEventListener("focus", onFocus);
      clearInterval(intervalId);
    };
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

  return (
    <div className="sf-shell">
      <section className="sf-container container sf-shop-header section">
        <h1 className="sf-shop-title">Shop Womenswear</h1>
        <p className="sf-shop-subtitle">Premium everyday styles with clean tailoring and modern silhouettes.</p>

        <div className="sf-filter-row" role="tablist" aria-label="Category filters">
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

        <button type="button" className="sf-mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
          <Icons.Filter />
          Filters
        </button>
      </section>

      <section className="sf-container container sf-main-layout main-layout section">
        <div className="sf-sidebar-desktop">
          <Sidebar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
          />
        </div>

        <div className="products">
          <div className="sf-toolbar">
            <p className="sf-results">{visibleProducts.length} products</p>
            <select className="sf-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

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

          {!isLoading && isError && (
            <div className="sf-state">
              <h3>Could not load products</h3>
              <p>Please check your connection and try again.</p>
              <div style={{ marginTop: "12px" }}>
                <button type="button" className="sf-btn sf-btn-primary" onClick={loadProducts}>Retry</button>
              </div>
            </div>
          )}

          {!isLoading && !isError && visibleProducts.length === 0 && (
            <div className="sf-state">
              <h3>No products found</h3>
              <p>Try resetting category or increasing the max price filter.</p>
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="sf-btn"
                  onClick={() => {
                    setActiveCategory("All");
                    setPriceMax(20000);
                  }}>
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && visibleProducts.length > 0 && (
            <div className="sf-products-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product._id} product={product} setPage={setPage} setSelectedProduct={setSelectedProduct} />
              ))}
            </div>
          )}
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="sf-drawer-backdrop" onClick={() => setMobileFiltersOpen(false)}>
          <div className="sf-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sf-drawer-head">
              <strong>Filters</strong>
              <button type="button" className="sf-icon-btn" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <Icons.X />
              </button>
            </div>
            <Sidebar
              activeCategory={activeCategory}
              setActiveCategory={(category) => {
                setActiveCategory(category);
                setMobileFiltersOpen(false);
              }}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
            />
          </div>
        </div>
      )}

      <Footer setPage={setPage} />
    </div>
  );
}
