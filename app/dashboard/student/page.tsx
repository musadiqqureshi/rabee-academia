import {
  BookOpen,
  Wallet,
  Video,
  CalendarDays,
  FileText,
  GraduationCap,
  Bell,
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
  { label: "My Subjects", icon: BookOpen },
  { label: "Payments", icon: Wallet },
  { label: "Class Links", icon: Video },
  { label: "Schedule", icon: CalendarDays },
  { label: "Resources", icon: FileText },
  { label: "Notifications", icon: Bell },
];

export default async function StudentDashboard() {
  const profile = await requireRole("student");

  return (
    <DashboardShell
      roleLabel="Student"
      userName={profile.full_name ?? profile.email ?? "Student"}
      navItems={navItems}
    >
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {profile.full_name?.split(" ")[0] ?? "Student"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Enrolled Subjects" value="—" icon={BookOpen} />
        <StatCard label="Payment Status" value="—" icon={Wallet} />
        <StatCard label="Class Type" value="—" icon={CalendarDays} />
        <StatCard label="Assigned Teacher" value="—" icon={GraduationCap} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="Enroll & pay"
          description="Select your education level and subject, choose regular or weekend classes, and pay via AssanPay or IBAN."
          icon={Wallet}
        />
        <PlaceholderPanel
          title="Your classes"
          description="Join Google Meet classes, view your schedule, and download learning resources."
          icon={Video}
        />
      </div>
    </DashboardShell>
  );
}
