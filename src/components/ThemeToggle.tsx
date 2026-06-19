"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Site theme switch (marketing pages). The public site defaults to dark; the
 * user's choice is remembered in localStorage ("site-theme"). Dashboard, login
 * and register pages are always light and ignore this preference.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("site-theme", next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/60 text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors shrink-0 ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
