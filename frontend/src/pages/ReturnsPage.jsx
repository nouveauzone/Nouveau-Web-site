import { THEME } from "../styles/theme";
import OrnamentDivider from "../components/OrnamentDivider";
import Footer from "../components/Footer";

export default function ReturnsPage({ setPage }) {
  const steps = [
    { icon:"📦", title:"Initiate Return", desc:"WhatsApp us at +91 98765 43210 within 7 days of delivery with your order ID and reason." },
    { icon:"🏠", title:"Free Pickup", desc:"We arrange a free pickup from your doorstep within 2–3 business days." },
    { icon:"🔍", title:"Quality Check", desc:"Once received, our team inspects the item within 48 hours." },
    { icon:"💳", title:"Refund / Exchange", desc:"Refund credited to original payment method or store credit within 5–7 business days." },
  ];

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>
      <div style={{ background:`linear-gradient(135deg,#0a0a0a,#1a0500)`, padding:"72px 40px 48px" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.gold, marginBottom:"10px", textTransform:"uppercase" }}>Hassle-Free</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff" }}>Returns & Exchanges</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", marginTop:"8px", fontFamily:"'Poppins',sans-serif" }}>7-day easy returns. Free pickup. No questions asked.</p>
        </div>
      </div>

      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"60px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"20px", marginBottom:"56px" }}>
          {steps.map((s,i) => (
            <div key={i} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"28px 20px", textAlign:"center", boxShadow:"0 4px 16px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:"36px", marginBottom:"12px" }}>{s.icon}</div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:THEME.text, fontWeight:700, marginBottom:"8px" }}>{s.title}</p>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", marginBottom:"8px" }}>Return Policy</h2>
        <OrnamentDivider />
        {[
          ["Eligible Items","All unworn, unwashed items with original tags attached and in original packaging within 7 days of delivery."],
          ["Non-Returnable Items","Customised / made-to-measure garments, sarees that have been draped, items purchased during sale events, and innerwear."],
          ["Exchange Policy","We offer free size exchanges within 14 days of delivery, subject to stock availability."],
          ["Damaged or Wrong Items","If you received a damaged or incorrect item, contact us within 48 hours of delivery. We will arrange an immediate pickup and replacement at no cost."],
          ["Refund Timeline","Refunds are processed within 5–7 business days after the returned item passes our quality check."],
        ].map(([title, desc]) => (
          <div key={title} style={{ marginBottom:"28px", padding:"24px", background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"12px", borderLeft:`3px solid ${THEME.crimson}` }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:THEME.crimson, fontSize:"13px", letterSpacing:"1px", marginBottom:"8px" }}>{title.toUpperCase()}</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, lineHeight:1.8 }}>{desc}</p>
          </div>
        ))}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
