import { useState, useEffect, lazy, Suspense, useContext } from "react";
import Navbar from "./components/Navbar";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { THEME } from "./styles/theme";
import { GLOBAL_CSS } from "./styles/globalStyles";
import { AuthContext } from "./context/AuthContext";

const HomePage        = lazy(() => import("./pages/HomePage"));
const ShopPage        = lazy(() => import("./pages/ShopPage"));
const ProductPage     = lazy(() => import("./pages/ProductPage"));
const CartPage        = lazy(() => import("./pages/CartPage"));
const CheckoutPage    = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage= lazy(() => import("./pages/OrderSuccessPage"));
const AuthPage        = lazy(() => import("./pages/AuthPage"));
const AccountPage     = lazy(() => import("./pages/AccountPage"));
const WishlistPage    = lazy(() => import("./pages/WishlistPage"));
const AdminPage       = lazy(() => import("./pages/AdminPage"));
const AboutPage       = lazy(() => import("./pages/AboutPage"));
const ContactPage     = lazy(() => import("./pages/ContactPage"));
const SizeGuidePage   = lazy(() => import("./pages/SizeGuidePage"));
const ReturnsPage     = lazy(() => import("./pages/ReturnsPage"));
const ShippingPage    = lazy(() => import("./pages/ShippingPage"));
const TrackOrderPage  = lazy(() => import("./pages/TrackOrderPage"));
const FAQPage         = lazy(() => import("./pages/FAQPage"));
const TermsPage       = lazy(() => import("./pages/TermsPage"));

const LoadingSpinner = () => (
  <main style={{ minHeight:"60vh", display:"grid", placeItems:"center", background:THEME.bg }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ width:"40px", height:"40px", border:`3px solid ${THEME.border}`, borderTop:`3px solid ${THEME.gold}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
      <p style={{ color:THEME.textMuted, fontFamily:"'Poppins',sans-serif", fontSize:"12px", letterSpacing:"2px" }}>LOADING...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </main>
);

export default function App() {
  const [page, setPage] = useState("Home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case "Home":         return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "Shop":         return <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "EthnicWear":   return <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} initialCategory="Indian Ethnic Wear" />;
      case "WesternWear":  return <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} initialCategory="Indian Premium Western Wear" />;
      case "Product":      return <ProductPage product={selectedProduct} setPage={setPage} />;
      case "Cart":         return <CartPage setPage={setPage} />;
      case "Checkout":     return <CheckoutPage setPage={setPage} />;
      case "OrderSuccess": return <OrderSuccessPage setPage={setPage} />;
      case "Auth":         return <AuthPage setPage={setPage} />;
      case "Account":      return <AccountPage setPage={setPage} />;
      case "Wishlist":     return <WishlistPage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "Admin":        return <AdminPage />;
      case "About":        return <AboutPage setPage={setPage} />;
      case "Contact":      return <ContactPage setPage={setPage} />;
      case "SizeGuide":    return <SizeGuidePage setPage={setPage} />;
      case "Returns":      return <ReturnsPage setPage={setPage} />;
      case "Shipping":     return <ShippingPage setPage={setPage} />;
      case "TrackOrder":   return <TrackOrderPage setPage={setPage} />;
      case "FAQ":          return <FAQPage setPage={setPage} />;
      case "Terms":        return <TermsPage setPage={setPage} />;
      default:             return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AppErrorBoundary>
        <Navbar page={page} setPage={setPage} />
        <Suspense fallback={<LoadingSpinner />}>
          <main>{renderPage()}</main>
        </Suspense>

      </AppErrorBoundary>
    </>
  );
}
