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
    .category-cards { grid-template-columns: 1fr; }
    .main-layout { grid-template-columns: 1fr; }
    .container-main-layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .products { grid-template-columns: repeat(2, 1fr); }
    .collection-header h1 { font-size: 28px; }
  }

  @media(max-width: 480px) {
    body { font-size: 13px; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr !important; }
    .grid-2col { grid-template-columns: 1fr !important; }
    h1 { font-size: clamp(22px, 6vw, 32px); }
    h2 { font-size: clamp(18px, 5vw, 28px); }
    h3 { font-size: clamp(16px, 4vw, 22px); }
    .products { grid-template-columns: 1fr; }
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
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
    box-sizing: border-box;
  }

  img, svg { max-width: 100%; height: auto; display: block; }

  .collection-header {
    background: #b76e79;
    color: #fff;
    padding: 60px 20px;
    border-radius: 0 0 20px 20px;
  }

  .collection-header h1 {
    font-size: 42px;
    font-weight: 600;
  }

  .collection-header p {
    opacity: 0.8;
    margin-top: 8px;
  }

  .tabs {
    display: flex;
    gap: 20px;
    margin: 20px 0;
    border-bottom: 1px solid #eee;
  }

  .tabs button {
    background: none;
    border: none;
    padding: 10px 0;
    font-weight: 500;
    cursor: pointer;
    color: #666;
  }

  .tabs button.active {
    color: #b76e79;
    border-bottom: 2px solid #b76e79;
  }

  .category-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 30px 0;
  }

  .category-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #eee;
    transition: 0.3s;
  }

  .category-card:hover {
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .main-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 30px;
  }

  .container-main-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 20px;
  }

  .sidebar {
    width: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #eee;
  }

  .sidebar h4 {
    margin-bottom: 10px;
    font-size: 14px;
    color: #999;
  }

  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar li {
    padding: 10px 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: #555;
    transition: 0.3s;
  }

  .sidebar li:hover {
    background: #f5f5f5;
  }

  .sidebar li.active {
    background: #000;
    color: #fff;
    font-weight: 500;
  }

  .category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }

  .category-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 999px;
    background: #fff;
    font-size: 12px;
    cursor: pointer;
  }

  .category-btn.active {
    background: #000;
    color: #fff;
  }

  .products {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .product-card {
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    border: 1px solid #eee;
    transition: 0.3s;
  }

  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }

  .product-card img {
    width: 100%;
    height: 280px;
    object-fit: cover;
  }

  .product-info {
    padding: 12px;
  }

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

  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  img {
    max-width: 100%;
    display: block;
  }
`;
