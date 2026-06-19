import {
  Users, UserCheck, BookOpen, CalendarDays, Video, ClipboardCheck,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";
import { requireRole } from "@/lib/auth";

export default async function AdminOverview() {
  await requireRole("admin");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Academic Operations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Paid Students"       value="—" icon={UserCheck} />
        <StatCard label="Pending Enrollments" value="—" icon={Users} />
        <StatCard label="Regular Batches"     value="—" icon={BookOpen} />
        <StatCard label="Weekend Batches"     value="—" icon={CalendarDays} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="Enrollment approvals"
          description="Review students who have paid, verify their subject selection, and assign them to a teacher."
          icon={UserCheck}
        />
        <PlaceholderPanel
          title="Class & Meet links"
          description="Create regular and weekend batches and distribute Google Meet links to enrolled students."
          icon={Video}
        />
        <PlaceholderPanel
          title="Attendance tracking"
          description="Monitor attendance across all batches and generate weekly attendance reports."
          icon={ClipboardCheck}
        />
        <PlaceholderPanel
          title="Schedules"
          description="Set and manage class schedules for regular and weekend batches."
          icon={CalendarDays}
        />
      </div>
    </div>
  );
}
