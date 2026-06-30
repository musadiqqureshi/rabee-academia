import Link from "next/link";
import { Users, BookOpen, CalendarDays, FileText, Video, ClipboardCheck, Wallet } from "lucide-react";
import GradientStatCard from "@/components/dashboard/GradientStatCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import QuickActions, { type QuickAction } from "@/components/dashboard/QuickActions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";
const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

const QUICK: QuickAction[] = [
  { href: "/dashboard/teacher/students",   label: "My Students", icon: Users,          tone: "from-indigo-500 to-violet-600" },
  { href: "/dashboard/teacher/subjects",   label: "My Subjects", icon: BookOpen,       tone: "from-emerald-500 to-teal-600" },
  { href: "/dashboard/teacher/classes",    label: "Class Links", icon: Video,          tone: "from-sky-500 to-blue-600" },
  { href: "/dashboard/teacher/schedule",   label: "Schedule",    icon: CalendarDays,   tone: "from-amber-500 to-orange-600" },
  { href: "/dashboard/teacher/attendance", label: "Attendance",  icon: ClipboardCheck, tone: "from-rose-500 to-pink-600" },
  { href: "/dashboard/teacher/materials",  label: "Materials",   icon: FileText,       tone: "from-fuchsia-500 to-purple-600" },
];

export default async function TeacherOverview() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();
  const monthYear = new Date().toISOString().slice(0, 7);

  const { data: batches } = await supabase
    .from("batches").select("id, is_active, subject_id, subjects:subject_id ( name )").eq("teacher_id", profile.id);
  const batchIds = (batches ?? []).map((b) => b.id);
  const activeBatches = (batches ?? []).filter((b) => b.is_active);
  const safeBatch = batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"];

  const [{ data: enrollments }, { data: materials }, { data: salaryCfg }, { data: salaryPay }] = await Promise.all([
    supabase.from("enrollments").select("id, student_id, student_name, subjects:subject_id ( name )").in("batch_id", safeBatch).eq("status", "approved"),
    supabase.from("materials").select("id").in("batch_id", safeBatch),
    supabase.from("teacher_salary_config").select("per_student_rate, base_amount").eq("teacher_id", profile.id).maybeSingle(),
    supabase.from("salary_payments").select("status, amount").eq("teacher_id", profile.id).eq("month_year", monthYear).maybeSingle(),
  ]);

  const { data: pendingEnrollments } = await supabase
    .from("enrollments").select("id, student_name, student_email, created_at, subjects:subject_id ( name )")
    .in("batch_id", safeBatch).eq("status", "pending").order("created_at", { ascending: false }).limit(5);

  const studentCount = enrollments?.length ?? 0;
  const computedSalary = (salaryCfg?.base_amount ?? 0) + (salaryCfg?.per_student_rate ?? 0) * studentCount;
  const salaryPaid = salaryPay?.status === "paid";

  return (
    <div className="space-y-8">
      <RealtimeRefresher tables={["enrollments", "batches", "materials"]} />

      <WelcomeBanner
        title={`Welcome, ${profile.full_name?.split(" ")[0] ?? "Teacher"} 👋`}
        subtitle="Your teaching overview — students, subjects, attendance and salary at a glance."
        cta={{ label: "View my students", href: "/dashboard/teacher/students" }}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <GradientStatCard label="My Students" value={studentCount} icon={Users} tone="from-indigo-500 to-violet-600" />
        <GradientStatCard label="Active Subjects" value={activeBatches.length} icon={BookOpen} tone="from-emerald-500 to-teal-600" />
        <GradientStatCard label="Materials Shared" value={materials?.length ?? 0} icon={FileText} tone="from-sky-500 to-blue-600" />
        <GradientStatCard label={`Salary (${monthYear})`} value={computedSalary > 0 ? fmt(computedSalary) : "—"} icon={Wallet}
          tone={salaryPaid ? "from-emerald-500 to-teal-600" : "from-amber-500 to-orange-600"} hint={salaryPaid ? "Paid" : "Pending"} />
      </div>

      <QuickActions items={QUICK} />

      {activeBatches.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">My Assigned Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeBatches.map((b) => {
              const subject = b.subjects as unknown as { name: string } | null;
              return (
                <div key={b.id} className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center shrink-0"><BookOpen className="w-4 h-4" /></div>
                  <p className="text-sm font-medium truncate">{subject?.name ?? "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No subjects assigned yet. Contact the admin to create a batch for you.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {enrollments && enrollments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">My Students</h2>
              <Link href="/dashboard/teacher/students" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30"><tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {enrollments.slice(0, 6).map((e) => {
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

        {pendingEnrollments && pendingEnrollments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Pending Requests</h2>
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30"><tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {pendingEnrollments.map((e) => {
                    const subject = e.subjects as unknown as { name: string } | null;
                    return (
                      <tr key={e.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3"><p className="font-medium">{e.student_name ?? "—"}</p><p className="text-xs text-muted-foreground">{e.student_email}</p></td>
                        <td className="px-4 py-3 text-muted-foreground">{subject?.name ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
