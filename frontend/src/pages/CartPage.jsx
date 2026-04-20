import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";
import { resolveImageUrl } from "../utils/imageUrl";
import { getShippingCharge, SHIPPING_FREE_THRESHOLD } from "../data/constants";

const GOLD    = "#C9A227";
const CRIMSON = "#B71C1C";

export default function CartPage({ setPage }) {
  const { cart, dispatch } = useContext(CartContext);

  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping  = getShippingCharge(subtotal);
  const total     = subtotal+shipping;

  if (!cart.length) return (
    <div style={{background:THEME.bg,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"20px",padding:"60px 20px"}}>
        <div style={{width:"80px",height:"104px",background:"#fff",borderRadius:"16px",padding:"8px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px ${GOLD}20`}}>
          <img src="/nouveau-logo.png" alt="Nouveau" style={{width:"100%",height:"100%",objectFit:"contain"}} />
        </div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",color:THEME.text,marginTop:"8px"}}>Your cart is empty</h2>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",color:THEME.textMuted}}>Add some beautiful pieces to get started</p>
        <BtnPrimary onClick={()=>setPage("Shop")} style={{borderRadius:"99px",marginTop:"8px"}}>Browse Collections →</BtnPrimary>
      </div>
      <Footer setPage={setPage} />
    </div>
  );

  return (
    <div style={{background:THEME.bg,minHeight:"100vh",color:THEME.text}}>
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"60px 40px"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"42px",marginBottom:"8px"}}>Shopping Cart</h1>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted,marginBottom:"40px"}}>{cart.reduce((s,i)=>s+i.qty,0)} item{cart.reduce((s,i)=>s+i.qty,0)!==1?"s":""} in your cart</p>

        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:"40px"}} className="cart-sidebar">
          {/* Items */}
          <div>
            {cart.map((item,idx)=>(
              <div key={`${item._id}-${item.size}`} style={{
                display:"flex",gap:"20px",padding:"20px",
                background:THEME.bgCard,borderRadius:"16px",
                border:`1px solid ${THEME.border}`,marginBottom:"14px",
                transition:"border-color 0.2s",
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=`${GOLD}40`}
                onMouseLeave={e=>e.currentTarget.style.borderColor=THEME.border}>

                {/* Image */}
                <div onClick={()=>setPage("Shop")} style={{width:"90px",height:"115px",borderRadius:"12px",overflow:"hidden",flexShrink:0,cursor:"pointer",background:THEME.bgDark}}>
                  <img src={resolveImageUrl(item.images?.[0], "/ethnic1.jpeg")} alt={item.title}
                    style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.4s"}}
                    onMouseEnter={e=>e.target.style.transform="scale(1.06)"}
                    onMouseLeave={e=>e.target.style.transform="scale(1)"}
                    onError={e=>e.target.src="/ethnic1.jpeg"} />
                </div>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"6px"}}>
                    <div>
                      <p style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,color:THEME.text,lineHeight:1.3,marginBottom:"4px"}}>{item.title}</p>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted}}>{item.category}</p>
                    </div>
                    <button onClick={()=>dispatch({type:"REMOVE",id:item._id,size:item.size})}
                      style={{background:"none",border:`1px solid ${THEME.border}`,color:THEME.textMuted,cursor:"pointer",padding:"6px 10px",borderRadius:"8px",fontSize:"11px",fontFamily:"'Poppins',sans-serif",transition:"all 0.2s",flexShrink:0}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=CRIMSON;e.currentTarget.style.color=CRIMSON;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=THEME.border;e.currentTarget.style.color=THEME.textMuted;}}>
                      Remove
                    </button>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap",marginTop:"12px"}}>
                    {/* Size */}
                    <span style={{background:`${GOLD}15`,color:GOLD,padding:"4px 12px",borderRadius:"6px",fontFamily:"'Poppins',sans-serif",fontSize:"11px",fontWeight:600,border:`1px solid ${GOLD}30`}}>
                      Size: {item.size}
                    </span>

                    {/* Qty */}
                    <div style={{display:"flex",alignItems:"center",border:`1px solid ${THEME.border}`,borderRadius:"10px",overflow:"hidden"}}>
                      <button onClick={()=>item.qty>1?dispatch({type:"UPDATE_QTY",id:item._id,size:item.size,qty:item.qty-1}):dispatch({type:"REMOVE",id:item._id,size:item.size})}
                        style={{background:"none",border:"none",color:THEME.text,padding:"8px 14px",cursor:"pointer",fontSize:"16px",transition:"background 0.2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=THEME.bgDark}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
                      <span style={{padding:"8px 16px",borderLeft:`1px solid ${THEME.border}`,borderRight:`1px solid ${THEME.border}`,fontFamily:"'Poppins',sans-serif",fontSize:"13px",fontWeight:600,minWidth:"40px",textAlign:"center"}}>{item.qty}</span>
                      <button onClick={()=>dispatch({type:"UPDATE_QTY",id:item._id,size:item.size,qty:item.qty+1})}
                        style={{background:"none",border:"none",color:THEME.text,padding:"8px 14px",cursor:"pointer",fontSize:"16px",transition:"background 0.2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=THEME.bgDark}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
                    </div>

                    {/* Price */}
                    <div style={{marginLeft:"auto"}}>
                      <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"18px",fontWeight:700,color:GOLD}}>₹{(item.price*item.qty).toLocaleString("en-IN")}</span>
                      {item.qty>1&&<p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:THEME.textMuted,textAlign:"right"}}>₹{item.price.toLocaleString("en-IN")} each</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear cart */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"8px",flexWrap:"wrap",gap:"12px"}}>
              <BtnOutline onClick={()=>setPage("Shop")} color={THEME.textMuted} style={{borderRadius:"99px"}}>← Continue Shopping</BtnOutline>
              <button onClick={()=>dispatch({type:"CLEAR"})}
                style={{background:"none",border:`1px solid ${THEME.border}`,color:THEME.textMuted,cursor:"pointer",padding:"10px 20px",borderRadius:"99px",fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"1px",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=CRIMSON;e.currentTarget.style.color=CRIMSON;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=THEME.border;e.currentTarget.style.color=THEME.textMuted;}}>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary sidebar */}
          <div>
            <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"16px",padding:"28px",position:"sticky",top:"100px"}}>
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"24px",fontWeight:700}}>ORDER SUMMARY</p>

              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}>
                <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted}}>Subtotal</span>
                <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.text}}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:THEME.textMuted}}>Shipping</span>
                <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:shipping===0?"#2ecc71":THEME.text}}>{shipping===0?"FREE":`₹${shipping}`}</span>
              </div>
              {shipping>0&&<p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:THEME.textMuted,marginBottom:"8px",lineHeight:1.5}}>Add ₹{(SHIPPING_FREE_THRESHOLD-subtotal).toLocaleString("en-IN")} more for free shipping</p>}
              {shipping===0&&<p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:"#2ecc71",marginBottom:"8px"}}>🎉 You qualify for free shipping!</p>}

              <div style={{borderTop:`1px solid ${THEME.border}`,paddingTop:"16px",marginTop:"8px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700}}>Total</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,color:GOLD}}>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <BtnPrimary onClick={()=>setPage("Checkout")} style={{width:"100%",justifyContent:"center",borderRadius:"12px",padding:"16px",fontSize:"12px",letterSpacing:"2px"}}>
                PROCEED TO CHECKOUT →
              </BtnPrimary>

              <div style={{marginTop:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
                {[["🔒","Secure Payment"],["✅","Authentic Products"],["⚡","Fast Dispatch"]].map(([ic,t])=>(
                  <div key={t} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"13px"}}>{ic}</span>
                    <span style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted}}>{t}</span>
                  </div>
                ))}
              </div>

              {/* Payment icons */}
              <div style={{display:"flex",gap:"8px",marginTop:"16px",paddingTop:"16px",borderTop:`1px solid ${THEME.border}`}}>
                {["UPI","COD"].map(p=>(
                  <span key={p} style={{fontFamily:"'Poppins',sans-serif",fontSize:"9px",letterSpacing:"1px",color:THEME.textLight,background:"#fffbf0",padding:"4px 10px",borderRadius:"5px",border:`1px solid rgba(201,162,39,0.15)`}}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
