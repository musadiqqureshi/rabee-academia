"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Atom, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navLinks = [
    { name: "Home",     href: "/" },
    { name: "Subjects", href: "/#subjects" },
    { name: "Programs", href: "/#programs" },
    { name: "Teachers", href: "/#teachers" },
    { name: "Pricing",  href: "/pricing" },
    { name: "AI Tools", href: "/products" },
    { name: "Reviews",  href: "/#reviews" },
    { name: "Contact",  href: "/#contact" },
  ];

  return (
    <nav
      className={`transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm py-2"
          : "bg-transparent py-3"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0" data-testid="navbar-logo">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary relative shrink-0">
            <Atom className="w-4 h-4 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-lg"></div>
          </div>
          <span className="font-bold text-sm tracking-tight whitespace-nowrap">Rabee Academia</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.35)]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                data-testid="button-book-demo"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme switch + menu toggle */}
        <div className="lg:hidden flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            className="p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border py-4 px-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium py-2 border-b border-border/40 text-foreground/80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="mt-1 w-full py-2.5 text-center text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                className="w-full py-2 text-sm font-medium text-foreground/70 hover:text-destructive transition-colors text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium py-2 text-foreground/80"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="mt-1 w-full py-2.5 text-center text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}