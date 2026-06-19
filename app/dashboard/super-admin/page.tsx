import {
  Users, UserCog, GraduationCap, Wallet, Bell, Settings,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";
import { requireRole } from "@/lib/auth";

export default async function SuperAdminOverview() {
  await requireRole("super_admin");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"      value="—" icon={Users}      hint="All roles" />
        <StatCard label="Active Teachers"  value="—" icon={UserCog} />
        <StatCard label="Active Subjects"  value="—" icon={GraduationCap} />
        <StatCard label="Revenue (month)"  value="—" icon={Wallet} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="User management"
          description="Create staff accounts (admin, teacher), assign students to teachers, and manage all user roles."
          icon={Users}
        />
        <PlaceholderPanel
          title="Financial controls"
          description="Fee plans, AssanPay transaction log, IBAN receipt verification, and monthly revenue reports."
          icon={Wallet}
        />
        <PlaceholderPanel
          title="Notifications"
          description="Send announcements to all students, a specific batch, or individual users."
          icon={Bell}
        />
        <PlaceholderPanel
          title="Platform settings"
          description="Configure payment gateway keys, email templates, allowed subjects, and system preferences."
          icon={Settings}
        />
      </div>
    </div>
  );
}
