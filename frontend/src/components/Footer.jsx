import { useEffect, useState } from "react";
import NouveauLogo from "./Logo";
import { THEME } from "../styles/theme";

function VisitorCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    try {
      let current = parseInt(localStorage.getItem("nouveau_visitor_count") || "0", 10);
      if (!sessionStorage.getItem("nouveau_visited")) {
        current += 1;
        localStorage.setItem("nouveau_visitor_count", String(current));
        sessionStorage.setItem("nouveau_visited", "true");
      }
      setCount(current);
    } catch {
      setCount(null);
    }
  }, []);

  if (!count) return null;

  return (
    <span
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: "11px",
        color: "rgba(255,255,255,0.5)",
        letterSpacing: "1px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          boxShadow: "0 0 5px #22c55e",
        }}
      />
      {count.toLocaleString("en-IN")} visitors
    </span>
  );
}

export default function Footer({ setPage }) {
  const quickLinks = [
    { label: "Home", page: "Home" },
    { label: "Shop", page: "Shop" },
    { label: "Indian Ethnic Wear", page: "EthnicWear" },
    { label: "Premium Western Wear", page: "WesternWear" },
    { label: "About Us", page: "About" },
    { label: "Contact", page: "Contact" },
  ];

  const customerLinks = [
    { label: "Size Guide", page: "SizeGuide" },
    { label: "Returns & Exchanges", page: "Returns" },
    { label: "Shipping Information", page: "Shipping" },
    { label: "Track Order", page: "TrackOrder" },
    { label: "FAQ", page: "FAQ" },
  ];

  const connectLinks = [
    { label: "Instagram", href: "https://www.instagram.com/nouveauzon?igsh=aWc4bGltMGxkOWU2" },
    { label: "Facebook", href: "https://www.facebook.com/nouveauzone" },
    { label: "WhatsApp", href: "https://wa.me/916359027888" },
    { label: "Email Us", href: "mailto:nouveauzone@gmail.com" },
  ];

  const linkStyle = {
    color: "rgba(255,255,255,0.75)",
    fontSize: "13px",
    marginBottom: "10px",
    cursor: "pointer",
    fontFamily: "'Poppins',sans-serif",
    transition: "color 0.2s",
    display: "block",
    textDecoration: "none",
  };

  return (
    <footer style={{ background: THEME.crimson, padding: "72px 40px 32px", borderTop: `1px solid ${THEME.gold}55` }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px", paddingBottom: "48px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <NouveauLogo size={52} />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", color: "#fff", letterSpacing: "3px", margin: "16px 0 6px" }}>
            nouveau<span style={{ color: "#C9A227" }}>™</span>
          </div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "6px", color: THEME.gold }}>OWN YOUR AURA</p>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "12px" }}>
            Indian Ethnic Wear · Indian Premium Western Wear · Women's Wear
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }} className="footer-grid">
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.9, fontFamily: "'Poppins',sans-serif", fontStyle: "italic" }}>
              Premium women's wear crafted for the modern Indian. Celebrating the finest ethnic traditions alongside contemporary elegance.
            </p>
            <div style={{ marginTop: "20px" }}>
              {[["💬", "WhatsApp", "https://wa.me/916359027888"], ["✉️", "Email", "mailto:hello@nouveau.in"]].map(([icon, label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", fontFamily: "'Poppins',sans-serif", marginRight: "16px", marginBottom: "8px", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = THEME.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }}
                >
                  {icon} {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "20px", fontWeight: 600 }}>Quick Links</p>
            {quickLinks.map(({ label, page }) => (
              <span
                key={label}
                onClick={() => setPage(page)}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.color = THEME.gold;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "20px", fontWeight: 600 }}>Customer</p>
            {customerLinks.map(({ label, page }) => (
              <span
                key={label}
                onClick={() => setPage(page)}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.color = THEME.gold;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "20px", fontWeight: 600 }}>Connect</p>
            {connectLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = THEME.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Poppins',sans-serif" }}>© 2026 Nouveau™. All rights reserved. Women's Wear Only.</p>
          <VisitorCount />
          <div style={{ display: "flex", gap: "20px" }}>
            <span
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Poppins',sans-serif", cursor: "pointer" }}
              onClick={() => setPage("Terms")}
              onMouseEnter={(e) => {
                e.target.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              Terms & Conditions
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Poppins',sans-serif" }}>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  );
}
