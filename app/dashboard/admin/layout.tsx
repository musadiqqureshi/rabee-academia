import {
  Users, UserCheck, BookOpen, Video, ClipboardCheck, CalendarDays, BarChart3,
  ClipboardList, Receipt, Network, GraduationCap, TrendingUp, MessageSquare,
  UserCog, Wallet, Bell, Settings, UserCircle, Crown, UserPlus,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",     icon: <BarChart3 className="w-4 h-4" />,      href: "" },
  { label: "Analytics",    icon: <TrendingUp className="w-4 h-4" />,     href: "/analytics" },
  { label: "Enrollments",  icon: <UserCheck className="w-4 h-4" />,      href: "/enrollments" },
  { label: "Demo Requests", icon: <GraduationCap className="w-4 h-4" />, href: "/demos" },
  { label: "Completions",  icon: <GraduationCap className="w-4 h-4" />,  href: "/completions" },
  { label: "Messages",     icon: <MessageSquare className="w-4 h-4" />,  href: "/chat" },
  { label: "Students",     icon: <Users className="w-4 h-4" />,          href: "/students" },
  { label: "Batches",      icon: <BookOpen className="w-4 h-4" />,       href: "/batches" },
  { label: "Allocation",   icon: <Network className="w-4 h-4" />,        href: "/allocation" },
  { label: "Assignments",  icon: <ClipboardList className="w-4 h-4" />,  href: "/assignments" },
  { label: "Invoices",     icon: <Receipt className="w-4 h-4" />,        href: "/invoices" },
  { label: "Class Links",  icon: <Video className="w-4 h-4" />,          href: "/classes" },
  { label: "Attendance",   icon: <ClipboardCheck className="w-4 h-4" />, href: "/attendance" },
  { label: "Schedules",    icon: <CalendarDays className="w-4 h-4" />,   href: "/schedules" },
  { label: "Teachers",     icon: <UserCog className="w-4 h-4" />,        href: "/teachers" },
  { label: "Instructors",  icon: <UserPlus className="w-4 h-4" />,       href: "/instructors" },
  { label: "Subjects",     icon: <BookOpen className="w-4 h-4" />,       href: "/subjects" },
  { label: "AI Pro",       icon: <Crown className="w-4 h-4" />,          href: "/ai-pro" },
  { label: "Users",        icon: <UserCircle className="w-4 h-4" />,     href: "/users" },
  { label: "Payments",     icon: <Wallet className="w-4 h-4" />,         href: "/payments" },
  { label: "Notifications", icon: <Bell className="w-4 h-4" />,          href: "/notifications" },
  { label: "Settings",     icon: <Settings className="w-4 h-4" />,       href: "/settings" },
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
