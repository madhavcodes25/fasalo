"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "en" | "hi";
type Copy = {
  dashboard: string; advisories: string; logistics: string; orders: string;
  listings: string; browse: string; greeting: string; language: string;
};

const copy: Record<Language, Copy> = {
  en: { dashboard: "Dashboard", advisories: "Advisories", logistics: "Logistics", orders: "My Orders", listings: "My Listings", browse: "Browse", greeting: "Hello", language: "हिंदी" },
  hi: { dashboard: "डैशबोर्ड", advisories: "सलाह", logistics: "लॉजिस्टिक्स", orders: "मेरे ऑर्डर", listings: "मेरी फसलें", browse: "बाज़ार", greeting: "नमस्ते", language: "EN" },
};

const LanguageContext = createContext<{ language: Language; toggleLanguage: () => void; t: Copy } | undefined>(undefined);

function triggerGoogleTranslate(lang: Language) {
  // Attempt to use Google Translate API if loaded
  try {
    const select = document.querySelector<HTMLSelectElement>(
      ".goog-te-combo, select.goog-te-combo"
    );
    if (select) {
      select.value = lang === "hi" ? "hi" : "";
      select.dispatchEvent(new Event("change"));
      return;
    }
  } catch { /* ignored */ }

  // Fallback: cookie + reload
  if (lang === "hi") {
    document.cookie = "googtrans=/en/hi; path=/";
  } else {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  window.location.reload();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Read persisted preference
    const stored = localStorage.getItem("fasalo_lang") as Language | null;
    if (stored === "hi" || document.cookie.includes("googtrans=/en/hi")) {
      setLanguage("hi");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("fasalo_lang", newLang);
    triggerGoogleTranslate(newLang);
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
