import React, { useState, useEffect } from "react";
import { Atom, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Subjects", href: "#" },
    { name: "Programs", href: "#" },
    { name: "Teachers", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Reviews", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2" data-testid="navbar-logo">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
            <Atom className="w-6 h-6 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">Rabee Academia</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button
            className="px-4 py-2 text-sm font-semibold rounded-md border border-border hover:bg-muted transition-colors"
            data-testid="button-login"
          >
            Login
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            data-testid="button-book-demo"
          >
            Book Demo Class
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium py-2 border-b border-border/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <button className="w-full py-2 text-sm font-semibold rounded-md border border-border">
              Login
            </button>
            <button className="w-full py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground">
              Book Demo Class
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
