import React, { createContext, useState, useEffect, useContext, useMemo } from "react";

export const CurrencyContext = createContext(null);

const COUNTRY_TO_CURRENCY = {
  US: { code: "USD", symbol: "$" },
  GB: { code: "GBP", symbol: "£" },
  IN: { code: "INR", symbol: "₹" },
  AE: { code: "AED", symbol: "د.إ" },
  AU: { code: "AUD", symbol: "A$" },
  CA: { code: "CAD", symbol: "C$" },
  SG: { code: "SGD", symbol: "S$" },
};

// Default fallback limits wait time or API limits
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  EUR: 0.011,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
};

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        // 1. Fetch User Geo Location
        const geoRes = await fetch("https://ipapi.co/json/");
        if (!geoRes.ok) throw new Error("Geo API restricted");
        const geoData = await geoRes.json();
        
        const country = geoData?.country_code || "IN";
        const cMap = COUNTRY_TO_CURRENCY[country] || (geoData?.in_eu ? { code:"EUR", symbol:"€" } : { code: "USD", symbol: "$" }); // Default to USD for unknown
        const code = country === "IN" ? "INR" : cMap.code;
        const symbol = country === "IN" ? "₹" : cMap.symbol;

        setCurrencyCode(code);
        setCurrencySymbol(symbol);

        // 2. Fetch Exchange Rates against INR
        if (code !== "INR") {
          try {
            const rateRes = await fetch("https://open.er-api.com/v6/latest/INR");
            const rateData = await rateRes.json();
            if (rateData?.rates?.[code]) {
              setExchangeRate(rateData.rates[code]);
            } else {
              setExchangeRate(FALLBACK_RATES[code] || 1);
            }
          } catch (rateErr) {
            console.error("Currency API Error", rateErr);
            setExchangeRate(FALLBACK_RATES[code] || 1);
          }
        }
      } catch (err) {
        console.error("Geo IP tracking failed, defaulting to INR", err.message);
        // Default stays INR
      } finally {
        setLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  // Format Price Helper: formats INR price dynamically
  const formatPrice = useMemo(() => {
    return (inrAmount) => {
      const parsed = Number(inrAmount) || 0;
      if (currencyCode === "INR") {
        return `₹${parsed.toLocaleString("en-IN")}`;
      }
      const converted = Math.round(parsed * exchangeRate);
      return `${currencySymbol}${converted.toLocaleString("en-US")}`;
    };
  }, [currencyCode, currencySymbol, exchangeRate]);

  return (
    <CurrencyContext.Provider value={{ currencyCode, currencySymbol, exchangeRate, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
