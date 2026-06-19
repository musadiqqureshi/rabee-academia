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
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default async function StudentDashboard() {
  const profile = await requireRole("student");

  const navItems = [
    { label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "My Subjects", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Payments", icon: <Wallet className="w-4 h-4" /> },
    { label: "Class Links", icon: <Video className="w-4 h-4" /> },
    { label: "Schedule", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Resources", icon: <FileText className="w-4 h-4" /> },
    { label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  ];

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
