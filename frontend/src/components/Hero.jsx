import heroImg from "../assets/images/banner.png";
import { THEME } from "../styles/theme";
import NouveauLogo from "./Logo";

export default function Hero({ setPage }) {
  return (
    <section className="hero-wrapper">
      <style>{`
        .hero-wrapper {
          position: relative;
          width: 100%;
          min-height: auto;
          background: #fdfaf7;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }

        .hero-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .hero-bg-image {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 60%;
          object-fit: cover;
          object-position: center 20%;
          mask-image: linear-gradient(to right, transparent 0%, black 25%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 25%);
        }

        .hero-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(24px, 4vw, 60px) clamp(24px, 5vw, 80px);
          display: flex;
          flex-direction: column;
          pointer-events: none;
        }
        
        .hero-main > * {
          pointer-events: auto;
        }

        .logo-top-left {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: auto;
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #222;
          font-weight: 500;
        }
        
        .tm {
          font-family: sans-serif;
          font-size: 11px;
          vertical-align: super;
          color: #c89d53;
          margin-left: 2px;
          font-weight: 600;
        }

        .hero-content {
          margin-top: clamp(60px, 12vh, 140px);
          margin-bottom: clamp(60px, 10vh, 120px);
          max-width: 620px;
        }

        .golden-ornament {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          color: #c89d53;
        }
        
        .golden-ornament .line {
          height: 1px;
          width: 48px;
          background: #c89d53;
        }

        .main-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 6vw, 86px);
          line-height: 1.05;
          font-weight: 600;
          letter-spacing: -0.5px;
          margin: 0 0 24px 0;
          background: linear-gradient(to right, #ac4a5b 0%, #c47671 30%, #c89d53 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .subtitle {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(12px, 1.2vw, 15px);
          font-weight: 500;
          letter-spacing: 4px;
          color: #ac4a5b;
          margin: 0 0 24px 0;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .star-icon {
          margin-left: 10px;
          color: #d4a353;
          font-size: 16px;
        }

        .description {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(16px, 1.5vw, 19px);
          line-height: 1.6;
          color: #555555;
          margin: 0 0 44px 0;
          max-width: 500px;
        }

        .desktop-only {
          display: inline;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: clamp(60px, 10vh, 100px);
          flex-wrap: wrap;
        }

        .btn-shop {
          padding: 0 40px;
          height: 52px;
          background: #bb864c;
          color: #ffffff;
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 500;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(187, 134, 76, 0.25);
        }
        
        .btn-shop:hover {
          background: #a46d2f;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(187, 134, 76, 0.35);
        }

        .features-row {
          display: flex;
          gap: clamp(24px, 4vw, 48px);
          flex-wrap: wrap;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .feature-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          color: #bb864c;
        }

        .feature-text {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          letter-spacing: 1.5px;
          color: #222;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* --- MOBILE SPECIFIC FIXES --- */
        @media (max-width: 768px) {
          .hero-wrapper {
            flex-direction: column;
            min-height: auto;
            position: relative;
            padding-top: 0;
            background: #fdfaf7;
          }
          
          .desktop-only { display: none; }
          
          .hero-bg-container {
            position: relative;
            width: 100%;
            height: 55vh;
            min-height: 380px;
            order: 1;
            z-index: 0;
          }

          .hero-bg-container::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 120px;
            background: linear-gradient(to top, #fdfaf7 5%, transparent 100%);
            z-index: 1;
            pointer-events: none;
          }
          
          .hero-bg-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: 85% center !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
            left: 0 !important;
          }
          
          .hero-main {
            padding-top: 10px;
            padding-bottom: 40px;
            order: 2;
            margin-top: -50px;
            align-items: center;
            text-align: center;
            z-index: 10;
          }
          
          .logo-top-left {
            margin-bottom: 24px;
          }
          
          .hero-content {
            margin-top: 0;
            margin-bottom: 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .golden-ornament {
            margin-bottom: 16px;
          }
          
          .golden-ornament .line {
            width: 32px;
          }

          .main-title {
            font-size: 42px;
            line-height: 1.1;
            margin-bottom: 16px;
          }
          
          .subtitle {
            justify-content: center;
            letter-spacing: 2px;
            font-size: 10px;
            margin-bottom: 16px;
          }
          
          .description {
            font-size: 15px;
            margin-bottom: 32px;
          }
          
          .hero-actions {
            flex-direction: column;
            width: 100%;
            margin-bottom: 40px;
          }
          
          .btn-shop {
            width: 100%;
            max-width: 320px;
          }
          
          .features-row {
            flex-direction: row;
            justify-content: center;
            gap: 16px;
          }
          
          .feature {
            flex-direction: column;
            text-align: center;
            gap: 8px;
            width: 90px;
          }
          
          .feature-icon {
            width: 44px;
            height: 44px;
          }
          
          .feature-text {
            font-size: 9px;
            letter-spacing: 1px;
          }
        }
      `}</style>

      <div className="hero-bg-container" aria-hidden="true">
        <img className="hero-bg-image" src={heroImg} alt="Hero background" />
      </div>

      <div className="hero-main">
        <div className="logo-top-left">
          <NouveauLogo size={28} />
          <span className="logo-text">nouveau<span className="tm">™</span></span>
        </div>

        <div className="hero-content">
          <div className="golden-ornament">
            <div className="line" />
            <NouveauLogo size={22} />
            <div className="line" />
          </div>

          <h1 className="main-title">Wear Your Aura</h1>
          
          <p className="subtitle">
            INDIAN ETHNIC WEAR, REDEFINED <span className="star-icon">✦</span>
          </p>

          <p className="description">
            Timeless designs that celebrate tradition<br className="desktop-only"/>
            with a modern soul.
          </p>

          <div className="hero-actions">
            <button className="btn-shop" onClick={() => setPage("Shop")}>
              Shop Now
            </button>
          </div>

          <div className="features-row">
            <div className="feature">
              <div className="feature-icon">
                <NouveauLogo size={20} />
              </div>
              <div className="feature-text">
                PREMIUM<br/>QUALITY
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.6 15.5 20 11 20z"/>
                  <path d="M11 20c2-3 2-6-1-9"/>
                </svg>
              </div>
              <div className="feature-text">
                TIMELESS<br/>DESIGNS
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 0 0-7.7 7.7l1 1.1L12 21l7.8-7.7 1-1a5.5 5.5 0 0 0 0-7.7z"/>
                </svg>
              </div>
              <div className="feature-text">
                MADE FOR<br/>YOU
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}