"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/quranContent";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, toggle: () => {} });

export function useLang() {
  return useContext(Ctx);
}

// Shared EN/اردو toggle used on the landing page and course detail pages.
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`inline-flex items-center rounded-full border border-border bg-card/70 backdrop-blur-sm p-1 text-xs font-bold shadow-sm ${className}`}>
      <button onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-full transition ${lang === "en" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" : "text-muted-foreground hover:text-foreground"}`}>
        English
      </button>
      <button onClick={() => setLang("ur")}
        className={`px-3 py-1.5 rounded-full transition ${lang === "ur" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" : "text-muted-foreground hover:text-foreground"}`}>
        اردو
      </button>
    </div>
  );
}

// Provides the Quran-learning language choice, persisted so it survives
// navigation between the landing page and course detail pages. Defaults to
// English; flips the wrapper to RTL + an Urdu font when Urdu is selected.
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quran-lang");
      if (saved === "ur" || saved === "en") setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("quran-lang", l); } catch { /* ignore */ }
  };
  const toggle = () => setLang(lang === "en" ? "ur" : "en");

  return (
    <Ctx.Provider value={{ lang, setLang, toggle }}>
      <div dir={lang === "ur" ? "rtl" : "ltr"} className={lang === "ur" ? "font-urdu" : undefined}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
