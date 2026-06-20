import Link from "next/link";
import { Users, BookOpen, CalendarDays, FileText, Video, ClipboardCheck } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function TeacherOverview() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  // Fetch batches WITHOUT schedules join — schedules table may not exist yet
  const { data: batches } = await supabase
    .from("batches")
    .select("id, is_active, subject_id, subjects:subject_id ( name )")
    .eq("teacher_id", profile.id);

  const batchIds = (batches ?? []).map((b) => b.id);
  const activeBatches = (batches ?? []).filter((b) => b.is_active);

  const [{ data: enrollments }, { data: materials }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, student_id, student_name, subjects:subject_id ( name )")
      .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("status", "approved"),
    supabase
      .from("materials")
      .select("id")
      .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);

  // Pending/waiting enrollments (submitted but not yet approved)
  const { data: pendingEnrollments } = await supabase
    .from("enrollments")
    .select("id, student_name, student_email, created_at, subjects:subject_id ( name )")
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const quickLinks = [
    { href: "/dashboard/teacher/students",   label: "My Students",  icon: Users },
    { href: "/dashboard/teacher/subjects",   label: "My Subjects",  icon: BookOpen },
    { href: "/dashboard/teacher/classes",    label: "Class Links",  icon: Video },
    { href: "/dashboard/teacher/schedule",   label: "Schedule",     icon: CalendarDays },
    { href: "/dashboard/teacher/attendance", label: "Attendance",   icon: ClipboardCheck },
    { href: "/dashboard/teacher/materials",  label: "Materials",    icon: FileText },
  ];

  return (
    <div>
      <RealtimeRefresher tables={["enrollments", "batches", "materials"]} />
      <h1 className="text-2xl font-bold">Teaching Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Welcome, {profile.full_name?.split(" ")[0] ?? "Teacher"}
      </p>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <StatCard label="My Students"      value={enrollments?.length ?? 0}   icon={Users} />
        <StatCard label="Active Subjects"  value={activeBatches.length}        icon={BookOpen} />
        <StatCard label="Materials Shared" value={materials?.length ?? 0}      icon={FileText} />
        <StatCard label="Pending Requests" value={pendingEnrollments?.length ?? 0} icon={CalendarDays}
          hint={pendingEnrollments && pendingEnrollments.length > 0 ? "Waiting for admin approval" : undefined}
        />
      </div>

      {/* Assigned subjects */}
      {activeBatches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">My Assigned Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeBatches.map((b) => {
              const subject = b.subjects as unknown as { name: string } | null;
              const studentCount = (enrollments ?? []).filter(
                (e) => /* enrollment is in this batch */ batchIds.includes(b.id)
              ).length;
              return (
                <div key={b.id} className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{subject?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{studentCount} student{studentCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeBatches.length === 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No subjects assigned yet. Contact the admin to create a batch for you.
        </div>
      )}

      {/* Enrolled students list */}
      {enrollments && enrollments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Students</h2>
            <Link href="/dashboard/teacher/students" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.slice(0, 5).map((e) => {
                  const subject = e.subjects as unknown as { name: string } | null;
                  return (
                    <tr key={e.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{e.student_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{subject?.name ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Waiting list */}
      {pendingEnrollments && pendingEnrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Pending Requests (Waiting for Admin)</h2>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingEnrollments.map((e) => {
                  const subject = e.subjects as unknown as { name: string } | null;
                  return (
                    <tr key={e.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-medium">{e.student_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{e.student_email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{subject?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
