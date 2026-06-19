import {
  Users, BookOpen, CalendarDays, Video, ClipboardCheck, FileText, BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",    icon: <BarChart3 className="w-4 h-4" />,      href: "" },
  { label: "My Students", icon: <Users className="w-4 h-4" />,          href: "/students" },
  { label: "My Subjects", icon: <BookOpen className="w-4 h-4" />,       href: "/subjects" },
  { label: "Schedule",    icon: <CalendarDays className="w-4 h-4" />,   href: "/schedule" },
  { label: "Class Links", icon: <Video className="w-4 h-4" />,          href: "/classes" },
  { label: "Attendance",  icon: <ClipboardCheck className="w-4 h-4" />, href: "/attendance" },
  { label: "Materials",   icon: <FileText className="w-4 h-4" />,       href: "/materials" },
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
