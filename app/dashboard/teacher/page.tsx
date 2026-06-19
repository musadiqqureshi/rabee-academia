import Link from "next/link";
import { Users, BookOpen, CalendarDays, FileText, Video, ClipboardCheck } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherOverview() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, is_active, schedules ( day_of_week )")
    .eq("teacher_id", profile.id);

  const batchIds = batches?.map((b) => b.id) ?? [];

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id")
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("status", "approved");

  const { data: materials } = await supabase
    .from("materials")
    .select("id")
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayCount = batches?.filter((b) =>
    (b.schedules as { day_of_week: string }[] | null)?.some((s) => s.day_of_week === today)
  ).length ?? 0;

  const quickLinks = [
    { href: "/dashboard/teacher/students", label: "My Students", icon: Users },
    { href: "/dashboard/teacher/subjects", label: "My Subjects", icon: BookOpen },
    { href: "/dashboard/teacher/classes", label: "Class Links", icon: Video },
    { href: "/dashboard/teacher/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/dashboard/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/dashboard/teacher/materials", label: "Materials", icon: FileText },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Teaching Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Welcome, {profile.full_name?.split(" ")[0] ?? "Teacher"}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Students" value={enrollments?.length ?? 0} icon={Users} />
        <StatCard label="Active Batches" value={batches?.filter((b) => b.is_active).length ?? 0} icon={BookOpen} />
        <StatCard label="Classes Today" value={todayCount} icon={CalendarDays} hint={today} />
        <StatCard label="Materials Uploaded" value={materials?.length ?? 0} icon={FileText} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
        {quickLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-card border border-card-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
