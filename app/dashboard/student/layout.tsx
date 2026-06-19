import {
  BookOpen, Wallet, Video, CalendarDays, FileText, Bell, BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",       icon: <BarChart3 className="w-4 h-4" />,   href: "" },
  { label: "My Subjects",    icon: <BookOpen className="w-4 h-4" />,    href: "/subjects" },
  { label: "Payments",       icon: <Wallet className="w-4 h-4" />,      href: "/payments" },
  { label: "Class Links",    icon: <Video className="w-4 h-4" />,       href: "/classes" },
  { label: "Schedule",       icon: <CalendarDays className="w-4 h-4" />, href: "/schedule" },
  { label: "Resources",      icon: <FileText className="w-4 h-4" />,    href: "/resources" },
  { label: "Notifications",  icon: <Bell className="w-4 h-4" />,        href: "/notifications" },
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
