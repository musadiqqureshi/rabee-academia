import {
  Users,
  UserCheck,
  Wallet,
  CalendarDays,
  Video,
  BarChart3,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell, {
  type NavItem,
} from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

const navItems: NavItem[] = [
  { label: "Overview", icon: BarChart3 },
  { label: "Enrollments", icon: UserCheck },
  { label: "Students", icon: Users },
  { label: "Batches", icon: BookOpen },
  { label: "Class Links", icon: Video },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Schedules", icon: CalendarDays },
];

export default async function AdminDashboard() {
  const profile = await requireRole("admin");

  return (
    <DashboardShell
      roleLabel="Admin"
      userName={profile.full_name ?? profile.email ?? "Admin"}
      navItems={navItems}
    >
      <h1 className="text-2xl font-bold mb-6">Academic Operations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Paid Students" value="—" icon={UserCheck} />
        <StatCard label="Pending Enrollments" value="—" icon={Users} />
        <StatCard label="Regular Batches" value="—" icon={BookOpen} />
        <StatCard label="Weekend Batches" value="—" icon={CalendarDays} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="Enrollment approvals"
          description="Review paid students, check selected subjects, and assign teachers."
          icon={UserCheck}
        />
        <PlaceholderPanel
          title="Class & Meet links"
          description="Create regular/weekend batches and share Google Meet links with students."
          icon={Video}
        />
      </div>
    </DashboardShell>
  );
}
