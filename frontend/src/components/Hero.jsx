import heroImg from "../assets/images/banner.png";
import { THEME } from "../styles/theme";
import NouveauLogo from "./Logo";

export default function Hero({ setPage }) {
  return (
    <>
      <style>{`
        .desktop-hero { display: block; }
        .mobile-hero { display: none; }
        
        @media (max-width: 768px) {
          .desktop-hero { display: none !important; }
          .mobile-hero { display: block !important; }
        }

        /* --- DESKTOP CSS --- */
        .desktop-hero .hero-wrapper {
          position: relative;
          width: 100%;
          min-height: auto;
          background: #fdfaf7;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }

        .desktop-hero .hero-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .desktop-hero .hero-bg-image {
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

        .desktop-hero .hero-main {
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
        
        .desktop-hero .hero-main > * {
          pointer-events: auto;
        }

        .desktop-hero .logo-top-left {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: auto;
        }

        .desktop-hero .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #222;
          font-weight: 500;
        }
        
        .desktop-hero .tm {
          font-family: sans-serif;
          font-size: 11px;
          vertical-align: super;
          color: #c89d53;
          margin-left: 2px;
          font-weight: 600;
        }

        .desktop-hero .hero-content {
          margin-top: clamp(60px, 12vh, 140px);
          margin-bottom: clamp(60px, 10vh, 120px);
          max-width: 620px;
        }

        .desktop-hero .golden-ornament {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          color: #c89d53;
        }
        
        .desktop-hero .golden-ornament .line {
          height: 1px;
          width: 48px;
          background: #c89d53;
        }

        .desktop-hero .main-title {
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

        .desktop-hero .subtitle {
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
        
        .desktop-hero .star-icon {
          margin-left: 10px;
          color: #d4a353;
          font-size: 16px;
        }

        .desktop-hero .description {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(16px, 1.5vw, 19px);
          line-height: 1.6;
          color: #555555;
          margin: 0 0 44px 0;
          max-width: 500px;
        }

        .desktop-hero .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: clamp(60px, 10vh, 100px);
          flex-wrap: wrap;
        }

        .desktop-hero .btn-shop {
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
        
        .desktop-hero .btn-shop:hover {
          background: #a46d2f;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(187, 134, 76, 0.35);
        }

        .desktop-hero .features-row {
          display: flex;
          gap: clamp(24px, 4vw, 48px);
          flex-wrap: wrap;
        }

        .desktop-hero .feature {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .desktop-hero .feature-icon {
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

        .desktop-hero .feature-text {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          letter-spacing: 1.5px;
          color: #222;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* --- MOBILE CSS --- */
        .mobile-hero {
          width: 100%;
          background: #fdfaf7;
          display: flex;
          flex-direction: column;
        }

        .mobile-hero .m-image-container {
          width: 100%;
          height: 55vh;
          min-height: 400px;
          position: relative;
        }

        .mobile-hero .m-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }

        .mobile-hero .m-fade {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 120px;
          background: linear-gradient(to top, #fdfaf7, transparent);
        }

        .mobile-hero .m-content {
          padding: 0 24px 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: -30px;
          z-index: 10;
          position: relative;
        }

        .mobile-hero .m-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
        }

        .mobile-hero .m-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #222;
          font-weight: 500;
        }

        .mobile-hero .m-golden-ornament {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #c89d53;
        }

        .mobile-hero .m-golden-ornament .line {
          height: 1px;
          width: 32px;
          background: #c89d53;
        }

        .mobile-hero .m-title {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          line-height: 1.1;
          font-weight: 600;
          margin: 0 0 16px 0;
          background: linear-gradient(to right, #ac4a5b 0%, #c47671 30%, #c89d53 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .mobile-hero .m-subtitle {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          color: #ac4a5b;
          margin: 0 0 16px 0;
          text-transform: uppercase;
        }

        .mobile-hero .m-description {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #555555;
          margin: 0 0 32px 0;
          max-width: 320px;
        }

        .mobile-hero .m-btn-shop {
          width: 100%;
          max-width: 340px;
          height: 52px;
          background: #bb864c;
          color: #ffffff;
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 16px;
          font-weight: 500;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          margin-bottom: 40px;
          box-shadow: 0 8px 24px rgba(187, 134, 76, 0.25);
        }

        .mobile-hero .m-features {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          gap: 16px;
        }

        .mobile-hero .m-feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          width: 90px;
        }

        .mobile-hero .m-feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: #bb864c;
        }

        .mobile-hero .m-feature-text {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 9px;
          line-height: 1.3;
          letter-spacing: 1px;
          color: #222;
          font-weight: 600;
          text-transform: uppercase;
        }
      `}</style>
      
      {/* ---------- DESKTOP HERO ---------- */}
      <div className="desktop-hero">
        <section className="hero-wrapper">
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
      </div>

      {/* ---------- MOBILE HERO ---------- */}
      <div className="mobile-hero">
        <div className="m-image-container">
          <img className="m-image" src={heroImg} alt="Hero mobile background" />
          <div className="m-fade" />
        </div>

        <div className="m-content">
          <div className="m-logo">
            <NouveauLogo size={24} />
            <span className="m-logo-text">nouveau<span className="tm" style={{fontFamily: 'sans-serif', fontSize: '10px', verticalAlign: 'super', color: '#c89d53', marginLeft: '2px', fontWeight: 600}}>™</span></span>
          </div>

          <div className="m-golden-ornament">
            <div className="line" />
            <NouveauLogo size={18} />
            <div className="line" />
          </div>

          <h1 className="m-title">Wear Your Aura</h1>
          
          <p className="m-subtitle">
            INDIAN ETHNIC WEAR, REDEFINED <span style={{marginLeft: '6px', color: '#d4a353', fontSize: '12px'}}>✦</span>
          </p>

          <p className="m-description">
            Timeless designs that celebrate tradition with a modern soul.
          </p>

          <button className="m-btn-shop" onClick={() => setPage("Shop")}>
            Shop Now
          </button>

          <div className="m-features">
            <div className="m-feature">
              <div className="m-feature-icon">
                <NouveauLogo size={20} />
              </div>
              <div className="m-feature-text">PREMIUM<br/>QUALITY</div>
            </div>
            
            <div className="m-feature">
              <div className="m-feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.6 15.5 20 11 20z"/><path d="M11 20c2-3 2-6-1-9"/>
                </svg>
              </div>
              <div className="m-feature-text">TIMELESS<br/>DESIGNS</div>
            </div>

            <div className="m-feature">
              <div className="m-feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 0 0-7.7 7.7l1 1.1L12 21l7.8-7.7 1-1a5.5 5.5 0 0 0 0-7.7z"/>
                </svg>
              </div>
              <div className="m-feature-text">MADE FOR<br/>YOU</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}