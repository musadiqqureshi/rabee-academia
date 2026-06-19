import {
  Users, UserCheck, BookOpen, Video, ClipboardCheck, CalendarDays, BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",     icon: BarChart3,      href: "" },
  { label: "Enrollments",  icon: UserCheck,      href: "/enrollments" },
  { label: "Students",     icon: Users,          href: "/students" },
  { label: "Batches",      icon: BookOpen,       href: "/batches" },
  { label: "Class Links",  icon: Video,          href: "/classes" },
  { label: "Attendance",   icon: ClipboardCheck, href: "/attendance" },
  { label: "Schedules",    icon: CalendarDays,   href: "/schedules" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("admin");
  return (
    <DashboardShell
      roleLabel="Admin"
      userName={profile.full_name ?? profile.email ?? "Admin"}
      basePath="/dashboard/admin"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
