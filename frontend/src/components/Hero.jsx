import heroImg from "../assets/images/banner.png";
import { THEME } from "../styles/theme";
import NouveauLogo from "./Logo";

export default function Hero({ setPage }) {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "92vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        background: `linear-gradient(90deg, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.72) 42%, rgba(250,247,242,0.12) 70%, rgba(250,247,242,0.0) 100%), url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-card {
          animation: fadeUp 1s ease;
        }

        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulseLine {
          0%, 100% { opacity: 0.55; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.08); }
        }

        @media (max-width: 768px) {
          .hero-wrap {
            padding: 0 16px !important;
          }

          .hero-card {
            max-width: 100% !important;
            padding: 22px !important;
            margin-left: 0 !important;
          }

          .hero-title {
            font-size: clamp(34px, 10vw, 58px) !important;
          }

          .hero-btn-row {
            flex-direction: column !important;
          }

          .hero-stats {
            flex-wrap: wrap !important;
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 18% 30%, rgba(212,175,55,0.10) 0%, transparent 24%), radial-gradient(circle at 8% 72%, rgba(183,110,121,0.08) 0%, transparent 20%), linear-gradient(to right, rgba(250,247,242,0.94), rgba(250,247,242,0.74), rgba(250,247,242,0.10), transparent)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "clamp(155px, 24vh, 220px)",
          right: "clamp(20px, 4vw, 52px)",
          opacity: 0.42,
          filter: "brightness(1.28) saturate(1.16) drop-shadow(0 8px 18px rgba(26,26,26,0.18))",
          mixBlendMode: "multiply",
          pointerEvents: "none",
          zIndex: 7,
        }}
      >
        <NouveauLogo size={168} />
      </div>

      <div
        style={{
          position: "absolute",
          top: "clamp(155px, 24vh, 220px)",
          left: "clamp(20px, 4vw, 52px)",
          opacity: 0.42,
          filter: "brightness(1.28) saturate(1.16) drop-shadow(0 8px 18px rgba(26,26,26,0.18))",
          mixBlendMode: "multiply",
          transform: "scaleX(-1)",
          pointerEvents: "none",
          zIndex: 7,
        }}
      >
        <NouveauLogo size={168} />
      </div>

      <div
        className="hero-wrap"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 clamp(16px, 5vw, 40px)",
        }}
      >
        <div
          className="hero-card"
          style={{
            width: "min(700px, 94%)",
            maxWidth: "720px",
            background: "rgba(255,255,255,0.52)",
            border: `1px solid ${THEME.border}`,
            borderRadius: "20px",
            padding: "clamp(20px, 5vw, 38px)",
            boxShadow: "0 18px 44px rgba(26,26,26,0.10)",
            backdropFilter: "blur(12px)",
            marginLeft: "0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: "auto -60px -70px auto", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)", pointerEvents: "none", animation: "floatSoft 6s ease-in-out infinite" }} />

          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "18px",
              opacity: 0.28,
              filter: "brightness(1.25) saturate(1.15) drop-shadow(0 6px 14px rgba(183,110,121,0.24))",
              transform: "scaleX(-1)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <NouveauLogo size={132} />
          </div>

          <div style={{ width: "64px", height: "2px", background: `linear-gradient(to right, ${THEME.crimson}, ${THEME.gold})`, marginBottom: "16px", animation: "pulseLine 4s ease-in-out infinite", position: "relative", zIndex: 4 }} />
          <h1
            className="hero-title"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(38px, 7vw, 68px)",
              lineHeight: 0.92,
              fontWeight: 600,
              letterSpacing: "-0.6px",
              background: `linear-gradient(to right, ${THEME.crimsonDark}, ${THEME.goldDark})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              position: "relative",
              zIndex: 4,
            }}
          >
            Wear Your Aura
          </h1>
          <p
            style={{
              marginTop: "16px",
              fontSize: "13px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              color: THEME.crimson,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
          </p>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
          </div>

          <div className="hero-btn-row" style={{ marginTop: "28px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("Shop")}
              style={{
                padding: "clamp(10px, 2vw, 12px) clamp(18px, 3vw, 26px)",
                background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})`,
                color: "#fff",
                fontWeight: 600,
                border: "none",
                borderRadius: "999px",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 22px rgba(212,175,55,0.28)",
                fontFamily: "'Poppins', sans-serif",
                minHeight: "44px",
                cursor: "pointer",
                fontSize: "clamp(10px, 1.5vw, 12px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Shop Now
            </button>

            <button
              onClick={() => setPage("Shop")}
              style={{
                padding: "clamp(10px, 2vw, 12px) clamp(18px, 3vw, 26px)",
                border: "1px solid #b76e79",
                background: "transparent",
                color: "#1a1a1a",
                borderRadius: "999px",
                transition: "all 0.3s ease",
                fontFamily: "'Poppins', sans-serif",
                minHeight: "44px",
                cursor: "pointer",
                fontSize: "clamp(10px, 1.5vw, 12px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = "#b76e79";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1a1a1a";
              }}
            >
              Explore Collection
            </button>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: "50%", bottom: "22px", transform: "translateX(-50%)", zIndex: 12 }}>
        <div style={{ width: "130px", height: "40px", background: "rgba(255,255,255,0.72)", border: `1px solid ${THEME.border}`, borderRadius: "999px", boxShadow: "0 12px 24px rgba(26,26,26,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backdropFilter: "blur(10px)" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: THEME.crimson, boxShadow: "0 0 0 5px rgba(183,110,121,0.18)" }} />
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: THEME.gold, opacity: 0.7 }} />
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: THEME.borderDark, opacity: 0.7 }} />
        </div>
      </div>
    </section>
  );
}