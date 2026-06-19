"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Light/dark theme switch.
 *
 * The theme is intentionally NOT persisted: every launch/reload forces the
 * premium light theme. The toggle only flips the `.dark` class on <html> for
 * the current session.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  // Force light theme on every launch.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setIsDark(false);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
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
