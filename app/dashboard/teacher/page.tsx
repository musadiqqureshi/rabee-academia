import {
  Users, BookOpen, CalendarDays, Wallet, FileText, ClipboardCheck,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";
import { requireRole } from "@/lib/auth";

export default async function TeacherOverview() {
  const profile = await requireRole("teacher");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Teaching Dashboard — {profile.full_name?.split(" ")[0] ?? "Teacher"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Students" value="—" icon={Users} />
        <StatCard label="Subjects"          value="—" icon={BookOpen} />
        <StatCard label="Classes This Week" value="—" icon={CalendarDays} />
        <StatCard label="Monthly Budget"    value="—" icon={Wallet} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="Your students"
          description="View assigned students, track their progress, and mark attendance. Fee details are never shown to teachers."
          icon={Users}
        />
        <PlaceholderPanel
          title="Materials & assignments"
          description="Upload study notes, post assignments, and review student submissions."
          icon={FileText}
        />
        <PlaceholderPanel
          title="Attendance"
          description="Mark student attendance for each session and view historical attendance records."
          icon={ClipboardCheck}
        />
        <PlaceholderPanel
          title="Class schedule"
          description="View your teaching schedule and Google Meet links for upcoming sessions."
          icon={CalendarDays}
        />
      </div>
    </div>
  );
}
