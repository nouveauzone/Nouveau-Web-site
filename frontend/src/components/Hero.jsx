import heroImg from "../assets/images/banner.png";
import { THEME } from "../styles/theme";
import NouveauLogo from "./Logo";

export default function Hero({ setPage }) {
  return (
    <section className="hero-shell">
      <style>{`
        .hero-shell {
          width: 100%;
          padding: clamp(28px, 6vw, 60px) clamp(16px, 5vw, 40px);
          background: linear-gradient(180deg, #fffdfa 0%, #f7f3ee 100%);
        }

        .hero {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(18px, 3vw, 36px);
        }

        .hero-text {
          flex: 1;
          min-width: 0;
          max-width: 720px;
        }

        .hero-card {
          position: relative;
          background: rgba(255, 255, 255, 0.64);
          border: 1px solid ${THEME.border};
          border-radius: 22px;
          padding: clamp(20px, 3.2vw, 40px);
          box-shadow: 0 18px 44px rgba(26, 26, 26, 0.10);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .hero-logo-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
          opacity: 0.1;
          filter: saturate(1.15) contrast(1.05);
        }

        .hero-title-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
          padding: clamp(8px, 1.2vw, 14px) 0;
          z-index: 1;
        }

        .hero-line {
          position: relative;
          z-index: 1;
          width: 86px;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(to right, ${THEME.crimson}, ${THEME.gold});
          margin-bottom: 16px;
        }

        .hero-title {
          position: relative;
          z-index: 1;
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 56px);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: -0.4px;
          background: linear-gradient(to right, ${THEME.crimsonDark}, ${THEME.goldDark});
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-buttons {
          position: relative;
          z-index: 1;
          margin-top: 28px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-media {
          flex: 1;
          min-width: 0;
          display: flex;
          justify-content: flex-end;
        }

        .hero-image {
          width: min(100%, 620px);
          border-radius: 24px;
          border: 1px solid ${THEME.border};
          box-shadow: 0 16px 36px rgba(26, 26, 26, 0.12);
          object-fit: cover;
          aspect-ratio: 16 / 11;
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            gap: 18px;
          }

          .hero-media {
            width: 100%;
            order: 1;
          }

          .hero-image {
            width: 100%;
            border-radius: 18px;
            aspect-ratio: 16 / 10;
          }

          .hero-text {
            width: 100%;
            max-width: 100%;
            order: 2;
          }

          .hero-card {
            backdrop-filter: blur(8px);
            padding: 20px;
            text-align: center;
          }

          .hero-line {
            margin: 0 auto 14px auto;
          }

          .hero-title {
            font-size: clamp(28px, 8.8vw, 42px);
            line-height: 1.2;
          }

          .hero-logo-center {
            opacity: 0.09;
          }

          .hero-buttons {
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
          }

          .hero-buttons button {
            width: 100%;
          }
        }
      `}</style>

      <div className="hero">
        <div className="hero-text">
          <div className="hero-card">
            <div className="hero-logo-center" aria-hidden="true">
              <NouveauLogo size={170} />
            </div>
            <div className="hero-line" />
            <div className="hero-title-wrap">
              <h1 className="hero-title">Wear Your Aura</h1>
            </div>

            <div className="hero-buttons">
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

        <div className="hero-media">
          <picture style={{ width: "100%", display: "block" }}>
            <source media="(max-width: 768px)" srcSet={heroImg} />
            <img className="hero-image" src={heroImg} alt="Nouveau hero" loading="eager" decoding="async" />
          </picture>
        </div>
      </div>
    </section>
  );
}