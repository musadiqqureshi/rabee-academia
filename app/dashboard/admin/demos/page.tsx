import { GraduationCap, Clock, Video } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import { scheduleDemo, setDemoStatus } from "./actions";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function AdminDemosPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: demos } = await supabase
    .from("demo_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = demos ?? [];
  const pending = rows.filter((d) => d.status === "pending").length;
  const scheduled = rows.filter((d) => d.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demo Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Students who requested a free demo class — assign a Google Meet link and time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Requests" value={rows.length} icon={GraduationCap} />
        <StatCard label="Awaiting Scheduling" value={pending} icon={Clock} />
        <StatCard label="Scheduled" value={scheduled} icon={Video} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No demo requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((d) => (
            <div key={d.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold">{d.full_name}</p>
                  <p className="text-xs text-muted-foreground">{d.email}{d.phone ? ` · ${d.phone}` : ""}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                    {d.subject_name && <span>Subject: {d.subject_name}</span>}
                    {d.education_level && <span>Level: {d.education_level}</span>}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[d.status] ?? "bg-muted"}`}>{d.status}</span>
              </div>

              {(d.preferred_times as string[] | null)?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {(d.preferred_times as string[]).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-xs">{t}</span>
                  ))}
                </div>
              ) : null}

              {d.message && <p className="text-sm text-foreground/80 bg-muted/40 rounded-lg p-2.5">{d.message}</p>}

              <form action={scheduleDemo} className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end pt-2 border-t border-border/50">
                <input type="hidden" name="demo_id" value={d.id} />
                <label className="block">
                  <span className="block text-xs text-muted-foreground mb-1">Google Meet link</span>
                  <input name="meet_link" defaultValue={d.meet_link ?? ""} placeholder="https://meet.google.com/…"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="block text-xs text-muted-foreground mb-1">Date &amp; time</span>
                  <input type="datetime-local" name="scheduled_at"
                    defaultValue={d.scheduled_at ? new Date(d.scheduled_at).toISOString().slice(0, 16) : ""}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Schedule</button>
              </form>

              {d.status !== "completed" && (
                <form action={setDemoStatus} className="flex gap-2">
                  <input type="hidden" name="demo_id" value={d.id} />
                  <button name="status" value="completed" className="text-xs text-emerald-600 hover:underline">Mark completed</button>
                  <button name="status" value="cancelled" className="text-xs text-muted-foreground hover:underline">Cancel</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
