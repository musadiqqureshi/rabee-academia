import {
  Users, UserCheck, BookOpen, Video, ClipboardCheck, CalendarDays, BarChart3,
  ClipboardList, Receipt, Network, GraduationCap, TrendingUp, MessageSquare,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",     icon: <BarChart3 className="w-4 h-4" />,      href: "" },
  { label: "Analytics",    icon: <TrendingUp className="w-4 h-4" />,     href: "/analytics" },
  { label: "Enrollments",  icon: <UserCheck className="w-4 h-4" />,      href: "/enrollments" },
  { label: "Demo Requests", icon: <GraduationCap className="w-4 h-4" />, href: "/demos" },
  { label: "Messages",     icon: <MessageSquare className="w-4 h-4" />,  href: "/chat" },
  { label: "Students",     icon: <Users className="w-4 h-4" />,          href: "/students" },
  { label: "Batches",      icon: <BookOpen className="w-4 h-4" />,       href: "/batches" },
  { label: "Allocation",   icon: <Network className="w-4 h-4" />,        href: "/allocation" },
  { label: "Assignments",  icon: <ClipboardList className="w-4 h-4" />,  href: "/assignments" },
  { label: "Invoices",     icon: <Receipt className="w-4 h-4" />,        href: "/invoices" },
  { label: "Class Links",  icon: <Video className="w-4 h-4" />,          href: "/classes" },
  { label: "Attendance",   icon: <ClipboardCheck className="w-4 h-4" />, href: "/attendance" },
  { label: "Schedules",    icon: <CalendarDays className="w-4 h-4" />,   href: "/schedules" },
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
