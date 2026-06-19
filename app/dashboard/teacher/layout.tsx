import {
  Users, BookOpen, CalendarDays, Video, ClipboardCheck, FileText, BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",    icon: BarChart3,      href: "" },
  { label: "My Students", icon: Users,          href: "/students" },
  { label: "My Subjects", icon: BookOpen,       href: "/subjects" },
  { label: "Schedule",    icon: CalendarDays,   href: "/schedule" },
  { label: "Class Links", icon: Video,          href: "/classes" },
  { label: "Attendance",  icon: ClipboardCheck, href: "/attendance" },
  { label: "Materials",   icon: FileText,       href: "/materials" },
];

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("teacher");
  return (
    <DashboardShell
      roleLabel="Teacher"
      userName={profile.full_name ?? profile.email ?? "Teacher"}
      basePath="/dashboard/teacher"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
