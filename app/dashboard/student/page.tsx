import Link from "next/link";
import {
  BookOpen, Wallet, Bell, CalendarDays, Video, FileText, ClipboardList,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function StudentOverview() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: enrollments }, { data: payments }, { data: notifications }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id, status, subjects:subject_id ( name )")
        .eq("student_id", profile.id),
      supabase
        .from("payments")
        .select("status")
        .eq("student_id", profile.id),
      supabase
        .from("notifications")
        .select("id, title, body, created_at, is_read")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const approvedEnrollments = (enrollments ?? []).filter((e) => e.status === "approved");
  const pendingPayments = (payments ?? []).filter(
    (p) => p.status === "pending" || p.status === "overdue"
  ).length;
  const unreadNotifs = (notifications ?? []).filter((n) => !n.is_read).length;
  const paymentLabel = pendingPayments > 0 ? `${pendingPayments} Due` : "All Clear";

  const quickLinks = [
    { href: "/dashboard/student/subjects",      label: "My Subjects",      icon: BookOpen },
    { href: "/dashboard/student/classes",        label: "Class Links",      icon: Video },
    { href: "/dashboard/student/schedule",       label: "Schedule",         icon: CalendarDays },
    { href: "/dashboard/student/resources",      label: "Resources",        icon: FileText },
    { href: "/dashboard/student/payments",       label: "Payments",         icon: Wallet },
    { href: "/dashboard/student/notifications",  label: "Notifications",    icon: Bell },
  ];

  return (
    <div>
      <RealtimeRefresher tables={["enrollments", "notifications", "payments"]} />
      <h1 className="text-2xl font-bold">
        Welcome back, {profile.full_name?.split(" ")[0] ?? "Student"}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Here&apos;s your learning overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Enrolled Subjects" value={approvedEnrollments.length} icon={BookOpen} />
        <StatCard
          label="Payment Status"
          value={paymentLabel}
          icon={Wallet}
          hint={pendingPayments > 0 ? "Action required" : "No outstanding payments"}
        />
        <StatCard label="Unread Notifications" value={unreadNotifs} icon={Bell} />
      </div>

      {/* Enrolled subjects summary */}
      {approvedEnrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">My Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {approvedEnrollments.map((e) => {
              const subject = e.subjects as { name: string } | null;
              return (
                <div key={e.id} className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{subject?.name ?? "—"}</span>
                </div>
              );
            })}
          </div>
          <Link href="/dashboard/student/subjects" className="text-xs text-primary hover:underline mt-2 inline-block">
            View details →
          </Link>
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

      {notifications && notifications.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Recent Notifications
          </h2>
          <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-4 flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? "bg-muted" : "bg-primary"}`} />
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/student/notifications" className="text-xs text-primary hover:underline mt-2 inline-block">
            View all notifications →
          </Link>
        </div>
      )}

      {(!notifications || notifications.length === 0) && approvedEnrollments.length === 0 && (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-8 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Once your enrollment is approved, your subjects and updates will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
