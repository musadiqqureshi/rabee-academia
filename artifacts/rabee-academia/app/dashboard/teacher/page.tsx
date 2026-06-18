import {
  Users,
  BookOpen,
  CalendarDays,
  Video,
  Wallet,
  ClipboardCheck,
  FileText,
  BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, {
  type NavItem,
} from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

const navItems: NavItem[] = [
  { label: "Overview", icon: BarChart3 },
  { label: "My Students", icon: Users },
  { label: "My Subjects", icon: BookOpen },
  { label: "Schedule", icon: CalendarDays },
  { label: "Class Links", icon: Video },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Materials", icon: FileText },
];

export default async function TeacherDashboard() {
  const profile = await requireRole("teacher");

  return (
    <DashboardShell
      roleLabel="Teacher"
      userName={profile.full_name ?? profile.email ?? "Teacher"}
      navItems={navItems}
    >
      <h1 className="text-2xl font-bold mb-6">Teaching Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Students" value="—" icon={Users} />
        <StatCard label="Assigned Subjects" value="—" icon={BookOpen} />
        <StatCard label="Classes This Week" value="—" icon={CalendarDays} />
        <StatCard label="Budget" value="—" icon={Wallet} hint="Allocated" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="Students & progress"
          description="View assigned students, track progress, and mark attendance. Fee details are never shown to teachers."
          icon={Users}
        />
        <PlaceholderPanel
          title="Materials & assignments"
          description="Upload study material, post assignments, and review submissions."
          icon={FileText}
        />
      </div>
    </DashboardShell>
  );
}
