import { useContext } from "react";
import Footer from "../components/Footer";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { THEME } from "../styles/theme";
import NouveauLogo from "../components/Logo";
import Icons from "../components/Icons";
import StarRating from "../components/StarRating";
import { BtnPrimary } from "../components/Buttons";

export default function WishlistPage({ setPage, setSelectedProduct }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch } = useContext(CartContext);

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"60px 40px" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"48px", marginBottom:"48px" }}>Wishlist</h1>
        {wishlist.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px" }}>
            <NouveauLogo size={64} />
            <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"20px", color:THEME.textMuted, marginTop:"20px", fontStyle:"italic" }}>Your wishlist is empty. Start exploring!</p>
            <div style={{ marginTop:"24px" }}>
              <BtnPrimary onClick={() => setPage("Shop")}>Explore Collection <Icons.Arrow /></BtnPrimary>
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:"20px" }}>
            {wishlist.map((p) => (
              <div key={p._id} style={{ background:THEME.bgCard, position:"relative", border:`1px solid ${THEME.border}` }}>
                <img
                  src={p.images?.[0] || "/product1.jpeg"}
                  alt={p.title}
                  style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/product1.jpeg";
                  }}
                />
                <button
                  onClick={() => toggleWishlist(p)}
                  aria-label="Remove from wishlist"
                  style={{
                    position:"absolute",
                    top:"12px",
                    right:"12px",
                    background:THEME.crimson,
                    border:"none",
                    color:"#fff",
                    cursor:"pointer",
                    width:"36px",
                    height:"36px",
                    borderRadius:"10px",
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    boxShadow:"0 8px 16px rgba(0,0,0,0.16)",
                  }}>
                  <Icons.Heart filled={false} />
                </button>
                <div style={{ padding:"18px" }}>
                  <StarRating rating={p.rating} count={p.reviews} />
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", margin:"8px 0 4px" }}>{p.title}</p>
                  <p style={{ color:THEME.crimson, fontWeight:700, marginBottom:"16px", fontFamily:"'Poppins', sans-serif", fontSize:"17px" }}>{p.price.toLocaleString()}</p>
                  <BtnPrimary onClick={() => cartDispatch({ type:"ADD", item:{ ...p, size:p.sizes[0] } })} style={{ width:"100%", justifyContent:"center" }}>Add to Cart</BtnPrimary>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
