"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EnforceTheme from "@/components/EnforceTheme";
import NotificationBell from "@/components/dashboard/NotificationBell";
import MessagesBadge from "@/components/dashboard/MessagesBadge";
import AnimatedBackground from "@/components/AnimatedBackground";
import ThemeToggle from "@/components/ThemeToggle";

export interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

interface DashboardShellProps {
  roleLabel: string;
  userName: string;
  navItems: NavItem[];
  basePath: string;
  children: ReactNode;
}

export default function DashboardShell({
  roleLabel,
  userName,
  navItems,
  basePath,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen text-foreground flex relative">
      <EnforceTheme mode="site" />
      <AnimatedBackground />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border flex flex-col transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md">
            <Atom className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">Rabee Academia</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive =
              item.href === ""
                ? pathname === basePath
                : pathname.startsWith(fullHref);
            return (
              <Link
                key={item.label}
                href={fullHref}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
                }`}
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>
                {item.label}
                {item.href === "/chat" && <MessagesBadge />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-background/85 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
              <p className="text-sm font-semibold leading-tight">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
