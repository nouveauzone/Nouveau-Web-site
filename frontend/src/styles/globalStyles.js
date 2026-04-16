import { THEME } from "./theme";

export const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    width: 100%;
  }

  body {
    background: ${THEME.bg};
    color: ${THEME.text};
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    line-height: 1.5;
  }

  ::selection { background: ${THEME.gold}40; color: ${THEME.text}; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${THEME.bgDark}; }
  ::-webkit-scrollbar-thumb { background: ${THEME.borderDark}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${THEME.gold}; }

  @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }

  /* Responsive Utilities */
  @media(max-width: 768px) {
    body { font-size: 14px; }
    .grid-2col { grid-template-columns: 1fr !important; }
    .hide-mobile { display: none !important; }
    .show-mobile { display: block !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .cart-sidebar { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
    .product-grid { grid-auto-flow: dense !important; }
    .your-section { padding: 15px !important; }
    .rating-box {
      position: static !important;
      margin-top: 20px !important;
      right: auto !important;
      max-width: 100% !important;
    }
  }

  @media(max-width: 480px) {
    body { font-size: 13px; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr !important; }
    .grid-2col { grid-template-columns: 1fr !important; }
    h1 { font-size: clamp(22px, 6vw, 32px); }
    h2 { font-size: clamp(18px, 5vw, 28px); }
    h3 { font-size: clamp(16px, 4vw, 22px); }
  }

  /* Touch-friendly elements */
  button, input[type="button"], input[type="submit"], a {
    min-height: 44px;
    min-width: 44px;
  }

  input, textarea, select {
    background: ${THEME.bgCard};
    color: ${THEME.text};
    border: 1.5px solid ${THEME.border};
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    min-height: 44px;
  }
  input::placeholder, textarea::placeholder { color: ${THEME.textLight}; }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${THEME.gold};
    box-shadow: 0 0 0 3px ${THEME.gold}18;
  }

  /* Prevent horizontal scroll */
  main {
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  .section { width: 100%; }
  .container { width: 100%; max-width: 100%; box-sizing: border-box; }

  img, svg { max-width: 100%; height: auto; display: block; }

  /* Temporary debug helper: add class debug-overflow on body while inspecting. */
  .debug-overflow * { outline: 1px solid red; }

  /* Loading skeleton animation */
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, ${THEME.bgDark} 25%, ${THEME.border} 50%, ${THEME.bgDark} 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; }
  input[type=range] { accent-color: ${THEME.gold}; }
`;
