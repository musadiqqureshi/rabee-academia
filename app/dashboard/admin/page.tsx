import Link from "next/link";
import { Users, UserCheck, BookOpen, GraduationCap, UserPlus, Wallet, Receipt, CalendarDays } from "lucide-react";
import { STATUS_LABEL, type ApplicationStatus } from "@/lib/instructor";
import StatDonut from "@/components/dashboard/StatDonut";
import GradientStatCard from "@/components/dashboard/GradientStatCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import QuickActions, { type QuickAction } from "@/components/dashboard/QuickActions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireRole("admin");
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: pendingCount },
    { count: batchCount },
    { count: teacherCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
  ]);

  const { data: allEnr } = await supabase.from("enrollments").select("status");
  const enrCounts = { approved: 0, pending: 0, rejected: 0 };
  for (const e of allEnr ?? []) {
    if (e.status === "approved") enrCounts.approved++;
    else if (e.status === "pending") enrCounts.pending++;
    else if (e.status === "rejected") enrCounts.rejected++;
  }

  const { data: pendingEnrollments } = await supabase
    .from("enrollments")
    .select("id, created_at, student_name, student_email, class_type, subjects:subject_id ( name )")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentStudents } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(5);

  // Instructor applications overview.
  const { count: instrTotal } = await supabase
    .from("instructor_applications").select("id", { count: "exact", head: true });
  const { count: instrAttention } = await supabase
    .from("instructor_applications").select("id", { count: "exact", head: true }).in("status", ["payment_submitted", "qualified"]);
  const { data: recentApps } = await supabase
    .from("instructor_applications")
    .select("id, full_name, email, subject_name, status, code, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "teacher")
    .order("full_name");

  const { data: batchesData } = await supabase
    .from("batches")
    .select("id, teacher_id, subjects:subject_id ( name )")
    .eq("is_active", true);

  const batchesByTeacher = new Map<string, { name: string }[]>();
  for (const b of batchesData ?? []) {
    const list = batchesByTeacher.get(b.teacher_id) ?? [];
    const subj = b.subjects as unknown as { name: string } | null;
    if (subj) list.push(subj);
    batchesByTeacher.set(b.teacher_id, list);
  }

  const adminQuick: QuickAction[] = [
    { href: "/dashboard/admin/enrollments", label: "Enrollments", icon: UserCheck,     tone: "from-indigo-500 to-violet-600" },
    { href: "/dashboard/admin/instructors", label: "Instructors", icon: UserPlus,      tone: "from-fuchsia-500 to-purple-600" },
    { href: "/dashboard/admin/payroll",     label: "Payroll",     icon: Wallet,        tone: "from-emerald-500 to-teal-600" },
    { href: "/dashboard/admin/invoices",    label: "Invoices",    icon: Receipt,       tone: "from-amber-500 to-orange-600" },
    { href: "/dashboard/admin/schedules",   label: "Schedules",   icon: CalendarDays,  tone: "from-sky-500 to-blue-600" },
    { href: "/dashboard/admin/teachers",    label: "Teachers",    icon: GraduationCap, tone: "from-rose-500 to-pink-600" },
  ];

  return (
    <div className="space-y-8">
      <RealtimeRefresher tables={["profiles", "enrollments", "batches"]} />

      <WelcomeBanner title="Academic Operations" subtitle="Platform management overview — students, teachers, enrollments, payroll and applications." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <GradientStatCard label="Total Students"      value={studentCount ?? 0} icon={Users}         tone="from-indigo-500 to-violet-600" />
        <GradientStatCard label="Pending Enrollments" value={pendingCount ?? 0} icon={UserCheck}     tone="from-amber-500 to-orange-600" hint={pendingCount ? "Needs review" : "All clear"} />
        <GradientStatCard label="Active Batches"      value={batchCount ?? 0}   icon={BookOpen}      tone="from-sky-500 to-blue-600" />
        <GradientStatCard label="Teachers"            value={teacherCount ?? 0} icon={GraduationCap} tone="from-emerald-500 to-teal-600" />
        <Link href="/dashboard/admin/instructors" className="block">
          <GradientStatCard label="Instructor Apps"   value={instrTotal ?? 0}   icon={UserPlus}      tone="from-fuchsia-500 to-purple-600" hint={instrAttention ? `${instrAttention} need attention` : undefined} />
        </Link>
      </div>

      <QuickActions items={adminQuick} title="Manage" />

      {/* Colorful charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <StatDonut title="Enrollments by status" slices={[
          { label: "Approved", value: enrCounts.approved, color: "#10b981" },
          { label: "Pending",  value: enrCounts.pending,  color: "#f59e0b" },
          { label: "Rejected", value: enrCounts.rejected, color: "#ef4444" },
        ]} />
        <StatDonut title="Platform composition" slices={[
          { label: "Students", value: studentCount ?? 0, color: "#3b82f6" },
          { label: "Teachers", value: teacherCount ?? 0, color: "#a855f7" },
          { label: "Active batches", value: batchCount ?? 0, color: "#f97316" },
        ]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

        {/* Pending enrollments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pending Enrollments</h2>
            <Link href="/dashboard/admin/enrollments" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          {pendingEnrollments && pendingEnrollments.length > 0 ? (
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
          ) : (
            <div className="bg-card border border-card-border rounded-xl p-6 text-center text-sm text-muted-foreground">
              No pending enrollments
            </div>
          )}
        </div>

        {/* Teachers & their assigned subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Teachers</h2>
            <Link href="/dashboard/admin/batches" className="text-xs text-primary hover:underline">
              Manage batches →
            </Link>
          </div>
          {teachers && teachers.length > 0 ? (
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Assigned Subjects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teachers.map((t) => {
                    const subjects = batchesByTeacher.get(t.id) ?? [];
                    return (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <p className="font-medium">{t.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {subjects.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600">No subjects assigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-card border border-card-border rounded-xl p-6 text-center text-sm text-muted-foreground">
              No teachers yet
            </div>
          )}
        </div>
      </div>

      {/* Instructor applications */}
      {recentApps && recentApps.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Instructor Applications</h2>
            <Link href="/dashboard/admin/instructors" className="text-xs text-primary hover:underline">Manage →</Link>
          </div>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentApps.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3"><p className="font-medium">{a.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{a.email}</p></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.subject_name}</td>
                    <td className="px-4 py-3 text-xs">{STATUS_LABEL[a.status as ApplicationStatus] ?? a.status}</td>
                    <td className="px-4 py-3 text-xs font-mono text-primary">{a.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent students */}
      {recentStudents && recentStudents.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Students</h2>
            <Link href="/dashboard/admin/students" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{s.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
