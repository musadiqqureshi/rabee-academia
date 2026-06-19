import {
  BookOpen, Wallet, CalendarDays, GraduationCap, Video, FileText,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";
import { requireRole } from "@/lib/auth";

export default async function StudentOverview() {
  const profile = await requireRole("student");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {profile.full_name?.split(" ")[0] ?? "Student"} 👋
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Enrolled Subjects" value="—" icon={BookOpen} />
        <StatCard label="Payment Status"    value="—" icon={Wallet} />
        <StatCard label="Class Type"        value="—" icon={CalendarDays} />
        <StatCard label="Assigned Teacher"  value="—" icon={GraduationCap} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderPanel
          title="Enroll in a subject"
          description="Choose your education level and subject, pick regular or weekend classes, and pay via AssanPay or IBAN bank transfer."
          icon={Wallet}
        />
        <PlaceholderPanel
          title="Join your classes"
          description="Access Google Meet links for your scheduled classes, view your timetable, and download study materials."
          icon={Video}
        />
        <PlaceholderPanel
          title="Study resources"
          description="Download AI-generated notes, past papers, and materials shared by your teacher."
          icon={FileText}
        />
        <PlaceholderPanel
          title="Track your progress"
          description="See your attendance record, assignment submissions, and performance over time."
          icon={BookOpen}
        />
      </div>
    </div>
  );
}
