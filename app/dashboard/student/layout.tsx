import {
  BookOpen, Wallet, Video, CalendarDays, FileText, Bell, BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",       icon: BarChart3,    href: "" },
  { label: "My Subjects",    icon: BookOpen,     href: "/subjects" },
  { label: "Payments",       icon: Wallet,       href: "/payments" },
  { label: "Class Links",    icon: Video,        href: "/classes" },
  { label: "Schedule",       icon: CalendarDays, href: "/schedule" },
  { label: "Resources",      icon: FileText,     href: "/resources" },
  { label: "Notifications",  icon: Bell,         href: "/notifications" },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("student");
  return (
    <DashboardShell
      roleLabel="Student"
      userName={profile.full_name ?? profile.email ?? "Student"}
      basePath="/dashboard/student"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
