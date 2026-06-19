import {
  Users,
  GraduationCap,
  Wallet,
  Bell,
  BarChart3,
  CalendarDays,
  Settings,
  BookOpen,
  UserCog,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default async function SuperAdminDashboard() {
  const profile = await requireRole("super_admin");

  const navItems = [
    { label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Users", icon: <Users className="w-4 h-4" /> },
    { label: "Teachers", icon: <UserCog className="w-4 h-4" /> },
    { label: "Subjects", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Payments", icon: <Wallet className="w-4 h-4" /> },
    { label: "Schedules", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <DashboardShell
      roleLabel="Super Admin"
      userName={profile.full_name ?? profile.email ?? "Super Admin"}
      navItems={navItems}
    >
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value="—" icon={Users} hint="All roles" />
        <StatCard label="Active Teachers" value="—" icon={UserCog} />
        <StatCard label="Subjects" value="—" icon={GraduationCap} />
        <StatCard label="Revenue" value="—" icon={Wallet} hint="This month" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="User & teacher management"
          description="Manage all users, assign students to teachers, and set teacher budgets."
          icon={Users}
        />
        <PlaceholderPanel
          title="Financial controls"
          description="Fee plans, AssanPay transactions, IBAN verification, and revenue reports."
          icon={Wallet}
        />
      </div>
    </DashboardShell>
  );
}
