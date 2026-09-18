"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "en" | "hi";
type Copy = { dashboard: string; advisories: string; logistics: string; orders: string; listings: string; browse: string; greeting: string; language: string };
const copy: Record<Language, Copy> = { 
  en: { dashboard: "Dashboard", advisories: "Advisories", logistics: "Logistics", orders: "My Orders", listings: "My Listings", browse: "Browse", greeting: "Hello", language: "हिंदी" }, 
  hi: { dashboard: "डैशबोर्ड", advisories: "सलाह", logistics: "लॉजिस्टिक्स", orders: "मेरे ऑर्डर", listings: "मेरी फसलें", browse: "बाज़ार", greeting: "नमस्ते", language: "EN" } 
};

const LanguageContext = createContext<{ language: Language; toggleLanguage: () => void; t: Copy } | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) { 
  const [language, setLanguage] = useState<Language>("en"); 

  useEffect(() => {
    // Check cookie on mount to set initial state
    if (document.cookie.includes("googtrans=/en/hi")) {
      setLanguage("hi");
    } else {
      setLanguage("en");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    
    // Use Google Translate cookie hack for full page translation
    if (newLang === "hi") {
      document.cookie = "googtrans=/en/hi; path=/";
    } else {
      document.cookie = "googtrans=/en/en; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    window.location.reload();
  }; 
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: copy[language] }}>
      {children}
    </LanguageContext.Provider>
  ); 
}

export function useLanguage() { 
  const context = useContext(LanguageContext); 
  if (!context) throw new Error("useLanguage must be used within LanguageProvider"); 
  return context; 
}
