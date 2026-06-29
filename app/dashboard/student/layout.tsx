import {
  BookOpen, Wallet, Video, CalendarDays, FileText, Bell, BarChart3,
  ClipboardList, ListChecks, Receipt, Sparkles, Award, MessageSquare, GraduationCap,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, { type NavItem } from "@/components/dashboard/DashboardShell";
import { markSelfPresent } from "./attendance-actions";
import type { ReactNode } from "react";

const navItems: NavItem[] = [
  { label: "Overview",       icon: <BarChart3 className="w-4 h-4" />,   href: "" },
  { label: "My Subjects",    icon: <BookOpen className="w-4 h-4" />,    href: "/subjects" },
  { label: "Assignments",    icon: <ClipboardList className="w-4 h-4" />, href: "/assignments" },
  { label: "Quizzes",        icon: <ListChecks className="w-4 h-4" />,  href: "/quizzes" },
  { label: "Rabee's AI",   icon: <Sparkles className="w-4 h-4" />,    href: "/ai-tutor" },
  { label: "Messages",       icon: <MessageSquare className="w-4 h-4" />, href: "/chat" },
  { label: "Payments",       icon: <Wallet className="w-4 h-4" />,      href: "/payments" },
  { label: "Invoices",       icon: <Receipt className="w-4 h-4" />,     href: "/invoices" },
  { label: "Certificates",   icon: <Award className="w-4 h-4" />,       href: "/certificates" },
  { label: "Class Links",    icon: <Video className="w-4 h-4" />,       href: "/classes" },
  { label: "Schedule",       icon: <CalendarDays className="w-4 h-4" />, href: "/schedule" },
  { label: "Resources",      icon: <FileText className="w-4 h-4" />,    href: "/resources" },
  { label: "Notifications",  icon: <Bell className="w-4 h-4" />,        href: "/notifications" },
  { label: "Become Instructor", icon: <GraduationCap className="w-4 h-4" />, href: "/instructor", absolute: true },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("student");
  // Auto-mark attendance present for today on login / portal visit.
  await markSelfPresent();
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
