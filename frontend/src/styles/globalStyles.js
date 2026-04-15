import { THEME } from "./theme";

export const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: ${THEME.bg};
    color: ${THEME.text};
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::selection { background: ${THEME.gold}40; color: ${THEME.text}; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${THEME.bgDark}; }
  ::-webkit-scrollbar-thumb { background: ${THEME.borderDark}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${THEME.gold}; }

  @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }

  @media(max-width:768px) {
    .grid-2col    { grid-template-columns: 1fr !important; }
    .hide-mobile  { display: none !important; }
    .stats-grid   { grid-template-columns: 1fr 1fr !important; }
    .cart-sidebar { grid-template-columns: 1fr !important; }
    .footer-grid  { grid-template-columns: 1fr 1fr !important; }
  }
  @media(max-width:480px) {
    .footer-grid  { grid-template-columns: 1fr !important; }
    .stats-grid   { grid-template-columns: 1fr 1fr !important; }
  }

  input, textarea, select {
    background: ${THEME.bgCard};
    color: ${THEME.text};
    border: 1.5px solid ${THEME.border};
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
  }
  input::placeholder, textarea::placeholder { color: ${THEME.textLight}; }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${THEME.gold};
    box-shadow: 0 0 0 3px ${THEME.gold}18;
  }

  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; }
  input[type=range] { accent-color: ${THEME.gold}; }
`;
