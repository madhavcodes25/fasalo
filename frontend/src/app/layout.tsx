import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Fasalo 🌾 — Farmer-to-Consumer Marketplace",
  description:
    "Fasalo (Fasal Seedhe Aapke Paas): a direct farmer-to-consumer digital marketplace for Smart India Hackathon (Problem 26033).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
    <html
      lang="en"
      className={`h-full antialiased font-sans`}
    >
      <head>
        <Script id="google-translate-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          function googleTranslateElementInit() { 
            new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'hi,en', autoDisplay: false}, 'google_translate_element'); 
          }
        ` }} />
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider><Header />{children}</LanguageProvider>
        </AuthProvider>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
      </body>
    </html>
  );
}
