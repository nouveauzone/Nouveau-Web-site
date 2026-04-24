import React, { useEffect, useState } from "react";
import heroImg from "../assets/images/banner.png";
import NouveauLogo from "./Logo";

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default function Hero({ setPage }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add a tiny delay to ensure smooth entry
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center bg-[#fdfcfb] overflow-hidden font-sans text-neutral-900">
      
      {/* Background Section */}
      <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
        {/* Clean gradient overlay on the left masking the image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdfcfb] via-[#fdfcfb]/80 to-transparent z-10 w-full md:w-[65%]"></div>
        <img 
          src={heroImg} 
          alt="Premium ethnic wear collection" 
          className="h-full w-full md:w-[60%] object-cover object-[center_30%] z-0" 
        />
      </div>

      {/* Main Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-32 pb-24 flex flex-col items-start min-h-[90vh]">
        
        {/* Animated Main Text Block */}
        <div className={`transition-all duration-1000 ease-out flex flex-col items-start max-w-2xl ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          <div className="flex items-center gap-2 mb-6 pointer-events-auto">
            <NouveauLogo size={28} />
            <span className="font-['Playfair_Display',serif] text-xl font-medium tracking-wider text-neutral-900">
              nouveau<span className="text-xs text-amber-600 align-super ml-1">™</span>
            </span>
          </div>

          <p className="text-amber-700 font-medium tracking-[0.2em] text-[11px] md:text-sm uppercase mb-3 flex items-center">
            Indian Ethnic Wear, Redefined <span className="ml-3 text-amber-500">✦</span>
          </p>

          <h1 className="font-['Playfair_Display',serif] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.1] text-neutral-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900">
            Wear Your Aura
          </h1>

          <p className="text-neutral-500 text-base md:text-lg lg:text-xl font-light mb-10 max-w-[420px] leading-relaxed">
            Timeless designs that celebrate tradition with a modern soul.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-8 pointer-events-auto">
            <button 
              onClick={() => setPage("Shop")}
              className="group relative flex items-center justify-center gap-2 px-9 py-4 bg-gradient-to-r from-[#C2964F] to-[#A36D33] text-white rounded-full font-medium shadow-[0_8px_20px_rgba(163,109,51,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(163,109,51,0.35)]"
            >
              Shop Now 
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            
            <button 
              onClick={() => setPage("Collections")}
              className="flex items-center justify-center px-9 py-4 border border-stone-300 bg-transparent text-stone-800 rounded-full font-medium transition-all duration-300 hover:bg-stone-50 hover:border-stone-400"
            >
              View Collections
            </button>
          </div>

          {/* Micro CTA */}
          <button 
            onClick={() => setPage("NewArrivals")}
            className="group relative flex items-center text-sm font-medium text-amber-800 transition-colors mb-16 pointer-events-auto"
          >
            <span className="relative z-10 pb-0.5 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-amber-600 after:origin-bottom-left after:transition-transform after:duration-300 group-hover:after:scale-x-100">
              ✨ New Arrivals — Just Dropped 
            </span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 text-amber-700">→</span>
          </button>

        </div>

        {/* Animated Trust Badges Base Row */}
        <div className={`transition-all duration-1000 delay-300 ease-out w-full grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mt-auto pt-10 border-t border-stone-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
              <TruckIcon />
            </div>
            <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-stone-700 uppercase leading-snug">
              Free Shipping<br className="hidden md:block"/> Across India
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
              <RefreshIcon />
            </div>
            <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-stone-700 uppercase leading-snug">
              7-Day Easy<br className="hidden md:block"/> Returns
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
              <StarIcon />
            </div>
            <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-stone-700 uppercase leading-snug">
              Premium Fabric<br className="hidden md:block"/> Guarantee
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
              <ShieldCheckIcon />
            </div>
            <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-stone-700 uppercase leading-snug">
              Secure Payments<br className="hidden md:block"/> (UPI / Cards)
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}