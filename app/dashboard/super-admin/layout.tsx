import {
  Users, UserCog, BookOpen, Wallet, CalendarDays, Bell, Settings, BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",      icon: BarChart3,  href: "" },
  { label: "Users",         icon: Users,      href: "/users" },
  { label: "Teachers",      icon: UserCog,    href: "/teachers" },
  { label: "Subjects",      icon: BookOpen,   href: "/subjects" },
  { label: "Payments",      icon: Wallet,     href: "/payments" },
  { label: "Schedules",     icon: CalendarDays, href: "/schedules" },
  { label: "Notifications", icon: Bell,       href: "/notifications" },
  { label: "Settings",      icon: Settings,   href: "/settings" },
];

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("super_admin");
  return (
    <DashboardShell
      roleLabel="Super Admin"
      userName={profile.full_name ?? profile.email ?? "Super Admin"}
      basePath="/dashboard/super-admin"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
