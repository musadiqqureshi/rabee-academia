"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Enforces the correct theme on client-side navigation (the inline head script
 * handles first paint with no flash).
 *  - mode="light":      always light (dashboard, login, register)
 *  - mode="site":       dark by default, honoring the user's saved site preference
 *  - mode="site-light": light by default, honoring the user's saved site preference
 */
export default function EnforceTheme({ mode }: { mode: "site" | "light" | "site-light" }) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "light") {
      root.classList.remove("dark");
      return;
    }
    let dark = mode !== "site-light"; // "site" defaults dark, "site-light" defaults light
    try {
      const pref = localStorage.getItem("site-theme");
      if (pref) dark = pref === "dark";
    } catch {
      /* ignore */
    }
    root.classList.toggle("dark", dark);
  }, [mode, pathname]);

  return null;
}
