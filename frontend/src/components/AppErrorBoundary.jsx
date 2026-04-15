import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px", background:"#fafaf8", fontFamily:"'Poppins',sans-serif", padding:"40px", textAlign:"center" }}>
          <div style={{ fontSize:"48px" }}>🪷</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", color:"#1a1008", margin:0 }}>Something went wrong</h2>
          <p style={{ color:"#888", fontSize:"14px", maxWidth:"400px", lineHeight:1.7, margin:0 }}>
            We encountered an unexpected error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ background:"#8B2035", color:"#fff", border:"none", padding:"14px 32px", borderRadius:"99px", fontSize:"13px", letterSpacing:"2px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontWeight:700 }}>
            REFRESH PAGE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
