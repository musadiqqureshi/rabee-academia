import { CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setBatchSchedule } from "./actions";
import GenerateScheduleButton from "./GenerateScheduleButton";

export const dynamic = "force-dynamic";

export default async function AdminSchedules() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, schedule_text, subjects:subject_id ( name ), profiles:teacher_id ( full_name )")
    .eq("is_active", true);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Schedules</h1>
          <p className="text-sm text-muted-foreground mt-1">Set class timings per batch, or let AI propose a clash-free schedule.</p>
        </div>
        <GenerateScheduleButton />
      </div>

      {(!batches || batches.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No batches yet</p>
          <p className="text-sm text-muted-foreground mt-1">Batches are created automatically when you approve enrollments.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {batches.map((b) => {
            const subject = b.subjects as unknown as { name: string } | null;
            const teacher = b.profiles as unknown as { full_name: string | null } | null;
            return (
              <div key={b.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{subject?.name ?? "Subject"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.class_type} · {teacher?.full_name ?? "Unassigned"}</p>
                  </div>
                </div>
                <form action={setBatchSchedule} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="batch_id" value={b.id} />
                  <input name="schedule_text" defaultValue={b.schedule_text ?? ""} placeholder="e.g. Mon, Wed, Fri · 5:00–6:00 PM"
                    className="flex-1 min-w-[240px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Save</button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
