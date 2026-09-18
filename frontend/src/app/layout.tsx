import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Header from "../components/Header";
import TranslateInit from "../components/TranslateInit";

export const metadata: Metadata = {
  title: "Fasalo — Farmer-to-Consumer Marketplace",
  description:
    "Fasalo (Fasal Seedhe Aapke Paas): a direct farmer-to-consumer digital marketplace for Smart India Hackathon 2026 (Problem 26033).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <Header />
            {children}
          </LanguageProvider>
        </AuthProvider>
        <TranslateInit />
        <div id="google_translate_element" style={{ display: "none" }}></div>
      </body>
    </html>
  );
}
