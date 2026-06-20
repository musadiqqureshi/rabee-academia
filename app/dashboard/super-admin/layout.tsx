import {
  Users, UserCog, BookOpen, Wallet, CalendarDays, Bell, Settings, BarChart3, MessageSquare,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",      icon: <BarChart3 className="w-4 h-4" />,    href: "" },
  { label: "Users",         icon: <Users className="w-4 h-4" />,        href: "/users" },
  { label: "Teachers",      icon: <UserCog className="w-4 h-4" />,      href: "/teachers" },
  { label: "Subjects",      icon: <BookOpen className="w-4 h-4" />,     href: "/subjects" },
  { label: "Payments",      icon: <Wallet className="w-4 h-4" />,       href: "/payments" },
  { label: "Schedules",     icon: <CalendarDays className="w-4 h-4" />, href: "/schedules" },
  { label: "Notifications", icon: <Bell className="w-4 h-4" />,         href: "/notifications" },
  { label: "Messages",      icon: <MessageSquare className="w-4 h-4" />, href: "/chat" },
  { label: "Settings",      icon: <Settings className="w-4 h-4" />,     href: "/settings" },
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
