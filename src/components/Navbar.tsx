"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { courses } from "@/lib/courses";
import ThemeToggle from "./ThemeToggle";

// All Rabee AI tools — shown in the Products dropdown.
const AI_TOOLS = [
  { name: "AI Paper Maker", href: "/products/paper-maker" },
  { name: "AI Essay Grader", href: "/products/essay-grader" },
  { name: "AI Lesson Planner", href: "/products/lesson-plan" },
  { name: "AI Notes & Flashcards", href: "/products/notes" },
  { name: "AI Study Planner", href: "/products/planner" },
  { name: "AI Quiz Maker", href: "/products/quiz" },
  { name: "AI Humanizer", href: "/products/humanizer" },
  { name: "Rabee AI Pro", href: "/products/pro" },
];

// Subjects grouped into a few categories for the horizontal mega-menu.
const SUBJECT_CATEGORY: Record<string, string> = {
  "FSc Level": "FSc",
  "A Level": "O / A Levels", "O Level": "O / A Levels", "A/O Level": "O / A Levels",
  "BS Level": "University (BS / MS)", "MS Level": "University (BS / MS)",
};
const SUBJECT_ORDER = ["FSc", "O / A Levels", "University (BS / MS)"];
const SUBJECT_GROUPS: Record<string, { name: string; slug: string }[]> = (() => {
  const g: Record<string, { name: string; slug: string }[]> = {};
  for (const c of courses) {
    if (c.slug.startsWith("quran-") || c.free) continue;
    const cat = SUBJECT_CATEGORY[c.level] ?? "Other";
    (g[cat] ??= []).push({ name: c.name, slug: c.slug });
  }
  return g;
})();

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openMenu, setOpenMenu] = useState<"subjects" | "products" | null>(null);
  const [mobileGroup, setMobileGroup] = useState<"subjects" | "products" | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const closeMobile = () => setIsMobileMenuOpen(false);

  const linkCls = "text-sm font-medium text-foreground/70 hover:text-primary transition-colors whitespace-nowrap";
  const navItems: { name: string; href?: string; dropdown?: "subjects" | "products" }[] = [
    { name: "Home", href: "/" },
    { name: "Subjects", dropdown: "subjects" },
    { name: "Teachers", href: "/#teachers" },
    { name: "Quran Learning", href: "/quran-learning" },
    { name: "Scholarship", href: "/scholarships" },
    { name: "Pricing", href: "/pricing" },
    { name: "Products", dropdown: "products" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <nav className={`transition-all duration-300 ease-in-out border-b border-border ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-md py-2.5" : "bg-background/80 backdrop-blur-md py-3.5"}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="navbar-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Rabee Academia" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          <span className="font-extrabold text-base tracking-tight whitespace-nowrap">Rabee Academia</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-5 flex-1 justify-center">
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.name} className="relative"
                onMouseEnter={() => setOpenMenu(item.dropdown!)} onMouseLeave={() => setOpenMenu(null)}>
                <button className={`inline-flex items-center gap-1 ${linkCls}`}>
                  {item.name} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenu === item.dropdown ? "rotate-180" : ""}`} />
                </button>

                {openMenu === item.dropdown && item.dropdown === "products" && (
                  <div className="absolute top-full left-0 pt-3 z-50">
                    <div className="w-60 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-xl p-2">
                      {AI_TOOLS.map((t) => (
                        <Link key={t.href} href={t.href} className="block px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors">{t.name}</Link>
                      ))}
                      <Link href="/products" className="block px-3 py-2 mt-1 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5">All AI Tools →</Link>
                    </div>
                  </div>
                )}

                {openMenu === item.dropdown && item.dropdown === "subjects" && (
                  <div className="absolute top-full left-0 pt-3 z-50">
                    <div className="flex gap-8 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-xl p-5">
                      {SUBJECT_ORDER.map((cat) => (
                        <div key={cat} className="min-w-[150px]">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">{cat}</p>
                          <div className="space-y-1.5">
                            {(SUBJECT_GROUPS[cat] ?? []).map((s) => (
                              <Link key={s.slug} href={`/courses/${s.slug}`} className="block text-sm text-foreground/75 hover:text-primary transition-colors whitespace-nowrap">{s.name}</Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-end">
                        <Link href="/pricing" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">View all &amp; pricing →</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.name} href={item.href!} className={linkCls}>{item.name}</Link>
            ),
          )}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.35)]">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <button onClick={handleSignOut} className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-destructive transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Sign in</Link>
              <Link href="/register" className="px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.35)]" data-testid="button-book-demo">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile: theme switch + menu toggle */}
        <div className="lg:hidden flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button className="p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border py-4 px-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.name} className="border-b border-border/40">
                <button
                  onClick={() => setMobileGroup(mobileGroup === item.dropdown ? null : item.dropdown!)}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold"
                  aria-expanded={mobileGroup === item.dropdown}
                >
                  {item.name}
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileGroup === item.dropdown ? "rotate-180" : ""}`} />
                </button>
                {mobileGroup === item.dropdown && (
                  <div className="flex flex-col gap-1.5 pl-3 pb-3">
                    {item.dropdown === "products"
                      ? [...AI_TOOLS, { name: "All AI Tools", href: "/products" }].map((t) => (
                          <Link key={t.href} href={t.href} onClick={closeMobile} className="text-sm text-foreground/75 hover:text-primary">{t.name}</Link>
                        ))
                      : SUBJECT_ORDER.map((cat) => (
                          <div key={cat}>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-1">{cat}</p>
                            {(SUBJECT_GROUPS[cat] ?? []).map((s) => (
                              <Link key={s.slug} href={`/courses/${s.slug}`} onClick={closeMobile} className="block py-0.5 text-sm text-foreground/75 hover:text-primary">{s.name}</Link>
                            ))}
                          </div>
                        ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.name} href={item.href!} className="text-sm font-medium py-2 border-b border-border/40 text-foreground/80" onClick={closeMobile}>{item.name}</Link>
            ),
          )}
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="mt-2 w-full py-2.5 text-center text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-center gap-2" onClick={closeMobile}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={() => { closeMobile(); handleSignOut(); }} className="w-full py-2 text-sm font-medium text-foreground/70 hover:text-destructive transition-colors text-left flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium py-2 text-foreground/80" onClick={closeMobile}>Sign in</Link>
              <Link href="/register" className="mt-1 w-full py-2.5 text-center text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={closeMobile}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
