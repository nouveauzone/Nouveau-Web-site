import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";
import { resolveImageUrl } from "../utils/imageUrl";
import { getShippingCharge, SHIPPING_FREE_THRESHOLD } from "../data/constants";

const GOLD = "#C9A227";
const CRIMSON = "#B71C1C";

export default function CartPage({ setPage }) {
  const { cart, dispatch } = useContext(CartContext);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = getShippingCharge(subtotal);
  const total = subtotal + shipping;

  if (!cart.length) {
    return (
      <div style={{ background: THEME.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", padding: "60px 20px" }}>
          <h2>Your cart is empty</h2>
          <BtnPrimary onClick={() => setPage("Shop")}>Browse Collections →</BtnPrimary>
        </div>
        <Footer setPage={setPage} />
      </div>
    );
  }

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 40px" }}>
        <h1>Shopping Cart</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "40px" }}>
          
          {/* ITEMS */}
          <div>
            {cart.map((item) => (
              <div key={`${item._id}-${item.size}`} style={{ padding: "20px", border: "1px solid #eee", marginBottom: "10px" }}>
                
                <p>{item.title}</p>

                <div>
                  <button onClick={() => dispatch({ type: "REMOVE", id: item._id, size: item.size })}>
                    Remove
                  </button>
                </div>

                <div>
                  <button
                    onClick={() =>
                      item.qty > 1
                        ? dispatch({ type: "UPDATE_QTY", id: item._id, size: item.size, qty: item.qty - 1 })
                        : dispatch({ type: "REMOVE", id: item._id, size: item.size })
                    }
                  >
                    -
                  </button>

                  <span>{item.qty}</span>

                  <button
                    onClick={() =>
                      dispatch({ type: "UPDATE_QTY", id: item._id, size: item.size, qty: item.qty + 1 })
                    }
                  >
                    +
                  </button>
                </div>

                <p>₹{(item.price * item.qty).toLocaleString("en-IN")}</p>

                {item.qty > 1 && (
                  <p>₹{item.price.toLocaleString("en-IN")} each</p>
                )}
              </div>
            ))}

            <button onClick={() => dispatch({ type: "CLEAR" })}>
              Clear Cart
            </button>
          </div>

          {/* SUMMARY */}
          <div>
            <div style={{ padding: "20px", border: "1px solid #eee" }}>
              
              <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>

              <p>
                Shipping:{" "}
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </p>

              {shipping > 0 && (
                <p>
                  Add ₹{(SHIPPING_FREE_THRESHOLD - subtotal).toLocaleString("en-IN")} more for free shipping
                </p>
              )}

              {shipping === 0 && (
                <p>🎉 Free Shipping Applied</p>
              )}

              <h3>Total: ₹{total.toLocaleString("en-IN")}</h3>

              <BtnPrimary onClick={() => setPage("Checkout")}>
                Proceed to Checkout
              </BtnPrimary>
            </div>
          </div>

        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}