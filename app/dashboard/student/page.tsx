import Link from "next/link";
import {
  BookOpen, Wallet, Bell, CalendarDays, Video, ClipboardList,
  ListChecks, Award, Sparkles,
} from "lucide-react";
import GradientStatCard from "@/components/dashboard/GradientStatCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import QuickActions, { type QuickAction } from "@/components/dashboard/QuickActions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

const QUICK: QuickAction[] = [
  { href: "/dashboard/student/subjects",   label: "My Subjects",  icon: BookOpen,      tone: "from-indigo-500 to-violet-600" },
  { href: "/dashboard/student/quizzes",    label: "Quizzes",      icon: ListChecks,    tone: "from-fuchsia-500 to-purple-600" },
  { href: "/dashboard/student/assignments",label: "Assignments",  icon: ClipboardList, tone: "from-amber-500 to-orange-600" },
  { href: "/dashboard/student/classes",    label: "Class Links",  icon: Video,         tone: "from-sky-500 to-blue-600" },
  { href: "/dashboard/student/schedule",   label: "Schedule",     icon: CalendarDays,  tone: "from-emerald-500 to-teal-600" },
  { href: "/dashboard/student/ai-tutor",   label: "Rabee's AI",   icon: Sparkles,      tone: "from-rose-500 to-pink-600" },
];

export default async function StudentOverview() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: enrollments }, { data: invoices }, { data: notifications }] =
    await Promise.all([
      supabase.from("enrollments").select("id, status, subjects:subject_id ( name )").eq("student_id", profile.id),
      supabase.from("invoices").select("amount_pkr, status").eq("student_id", profile.id),
      supabase.from("notifications").select("id, title, body, created_at, is_read").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(5),
    ]);

  const approved = (enrollments ?? []).filter((e) => e.status === "approved");
  const outstanding = (invoices ?? []).filter((i) => i.status === "issued" || i.status === "overdue").reduce((s, i) => s + i.amount_pkr, 0);
  const unread = (notifications ?? []).filter((n) => !n.is_read).length;
  const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

  return (
    <div className="space-y-8">
      <RealtimeRefresher tables={["enrollments", "notifications", "invoices", "payments"]} />

      <WelcomeBanner
        title={`Assalamu Alaikum, ${profile.full_name?.split(" ")[0] ?? "Student"} 👋`}
        subtitle="Here's your learning overview — your subjects, fees and latest updates at a glance."
        cta={{ label: "Browse courses", href: "/pricing" }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GradientStatCard label="Enrolled Subjects" value={approved.length} icon={BookOpen} tone="from-indigo-500 to-violet-600" hint="Active courses" />
        <GradientStatCard label="Outstanding Fees" value={outstanding > 0 ? fmt(outstanding) : "All clear"} icon={Wallet}
          tone={outstanding > 0 ? "from-amber-500 to-orange-600" : "from-emerald-500 to-teal-600"} hint={outstanding > 0 ? "Due by the 5th" : "No dues"} />
        <GradientStatCard label="Unread Notifications" value={unread} icon={Bell} tone="from-sky-500 to-blue-600" hint="Updates for you" />
      </div>

      <QuickActions items={QUICK} />

      {approved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Subjects</h2>
            <Link href="/dashboard/student/subjects" className="text-xs text-primary hover:underline">View details →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {approved.map((e) => {
              const subject = e.subjects as unknown as { name: string } | null;
              return (
                <div key={e.id} className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center shrink-0"><BookOpen className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">{subject?.name ?? "—"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Recent notifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Recent updates</h2>
            <Link href="/dashboard/student/notifications" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="bg-card border border-card-border rounded-2xl divide-y divide-border">
            {(notifications ?? []).length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No updates yet.</p>}
            {(notifications ?? []).map((n) => (
              <div key={n.id} className="px-5 py-4 flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? "bg-muted" : "bg-primary"}`} />
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee status card */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Fees</h2>
          <div className="rounded-2xl border border-card-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Outstanding balance</p>
            <p className={`text-3xl font-extrabold mt-1 ${outstanding > 0 ? "text-amber-600" : "text-emerald-600"}`}>{outstanding > 0 ? fmt(outstanding) : "PKR 0"}</p>
            <p className="text-xs text-muted-foreground mt-1">{outstanding > 0 ? "Please clear your fee by the 5th of the month." : "You're all caught up. Jazak Allah!"}</p>
            <Link href="/dashboard/student/invoices" className="mt-4 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
              View invoices
            </Link>
            <Link href="/dashboard/student/certificates" className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted">
              <Award className="w-4 h-4" /> My certificates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
