import React, { useEffect, useState } from "react";
import heroImg from "../assets/images/banner.png";

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default function Hero({ setPage }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full bg-[#fdfcfb] overflow-hidden font-sans text-neutral-900">
      
      <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-stretch min-h-[90vh]">
        
        {/* LEFT COLUMN: Text, Buttons, Mobile Image, Trust Badges */}
        <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col justify-center px-6 pt-16 pb-12 md:px-12 lg:px-20 md:py-24 z-10">
          
          {/* Animated Header & Actions Block */}
          <div className={`transition-all duration-1000 ease-out flex flex-col items-start ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            <h1 className="font-['Playfair_Display',serif] text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] leading-[1.1] text-neutral-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-stone-900 via-stone-800 to-[#9A6D3A]">
              Wear Your Aura
            </h1>

            <p className="text-sm md:text-lg font-light text-neutral-600 mb-8 max-w-[420px] leading-relaxed">
              Timeless designs that celebrate tradition with a modern soul.
            </p>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mb-6 md:mb-8">
              <button 
                onClick={() => setPage("Shop")}
                className="group w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C2964F] to-[#A36D33] text-white rounded-full font-medium shadow-[0_8px_20px_rgba(163,109,51,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(163,109,51,0.35)]"
              >
                Shop Now <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
              
              <button 
                onClick={() => setPage("Collections")}
                className="w-full md:w-auto flex items-center justify-center px-8 py-4 border border-stone-300 bg-transparent text-stone-800 rounded-full font-medium transition-all duration-300 hover:bg-stone-50 hover:border-stone-400"
              >
                View Collections
              </button>
            </div>

            {/* Micro CTA */}
            <button 
              onClick={() => setPage("NewArrivals")}
              className="group relative flex items-center justify-center md:justify-start w-full md:w-auto text-sm font-medium text-amber-800 transition-colors mb-8 md:mb-16"
            >
              <span className="relative z-10 pb-0.5 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-amber-600 after:origin-bottom-left after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                ✨ New Arrivals — Just Dropped 
              </span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 text-amber-700">→</span>
            </button>
          </div>

          {/* MOBILE FULL-WIDTH IMAGE: Placed perfectly between Micro CTA and Trust section */}
          <div className={`md:hidden -mx-6 w-[calc(100%+48px)] relative mb-10 transition-all duration-1000 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <img 
              src={heroImg} 
              alt="Premium ethnic wear" 
              className="w-full h-[55vh] min-h-[400px] object-cover object-[center_20%]" 
            />
            {/* Soft gradient bottom fade linking to badges */}
            <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-[#fdfcfb] to-transparent"></div>
          </div>

          {/* Trust Badges - 2x2 grid on mobile, wrapped row on desktop */}
          <div className={`transition-all duration-1000 delay-500 ease-out w-full grid grid-cols-2 md:flex md:flex-row md:flex-wrap gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-6 mt-auto ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
                <TruckIcon />
              </div>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-stone-700 uppercase leading-snug break-words">
                Free Shipping<br className="hidden md:block"/> Across India
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
                <RefreshIcon />
              </div>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-stone-700 uppercase leading-snug break-words">
                7-Day Easy<br className="hidden md:block"/> Returns
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
                <StarIcon />
              </div>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-stone-700 uppercase leading-snug break-words">
                Premium Fabric<br className="hidden md:block"/> Guarantee
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white shadow-sm flex flex-shrink-0 items-center justify-center text-[#9A6D3A]">
                <ShieldCheckIcon />
              </div>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-stone-700 uppercase leading-snug break-words">
                Secure Payments<br className="hidden md:block"/> (UPI / Cards)
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Image (Hidden on mobile) */}
        <div className="hidden md:block w-1/2 lg:w-[45%] relative z-0 min-h-[90vh]">
          {/* Edge fade blending the image right into the cream background */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fdfcfb] to-transparent z-10 pointer-events-none"></div>
          <img 
            src={heroImg} 
            alt="New Arrivals Fashion" 
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]" 
          />
        </div>

      </div>
    </section>
  );
}