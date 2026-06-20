"use client";

import { useState, useTransition } from "react";
import { Check, X, Clock, Save } from "lucide-react";
import { markAttendance } from "./actions";

interface Student { id: string; name: string }
interface Batch { id: string; label: string; students: Student[] }

const STATUSES = [
  { value: "present", label: "Present", icon: Check, on: "bg-emerald-600 text-white", off: "text-emerald-700" },
  { value: "late", label: "Late", icon: Clock, on: "bg-amber-500 text-white", off: "text-amber-700" },
  { value: "absent", label: "Absent", icon: X, on: "bg-red-600 text-white", off: "text-red-700" },
];

export default function MarkAttendanceForm({ batches }: { batches: Batch[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const batch = batches.find((b) => b.id === batchId);

  if (batches.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no batches yet. Ask an admin to create a batch for you.</p>;
  }

  function setAll(status: string) {
    if (!batch) return;
    const next: Record<string, string> = {};
    for (const s of batch.students) next[s.id] = status;
    setMarks(next);
  }

  function submit() {
    if (!batch) return;
    setMsg(null); setError(null);
    const fd = new FormData();
    fd.set("batch_id", batchId);
    fd.set("session_date", date);
    for (const s of batch.students) fd.set(`status_${s.id}`, marks[s.id] ?? "absent");
    startTransition(async () => {
      try {
        await markAttendance(fd);
        setMsg("Attendance saved.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5 space-y-4">
      <h2 className="font-semibold">Mark Attendance</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Batch</span>
          <select value={batchId} onChange={(e) => { setBatchId(e.target.value); setMarks({}); }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {batches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </label>
      </div>

      {batch && batch.students.length > 0 && (
        <div className="flex gap-2 text-xs">
          <span className="text-muted-foreground">Mark all:</span>
          <button onClick={() => setAll("present")} className="text-emerald-600 hover:underline">Present</button>
          <button onClick={() => setAll("absent")} className="text-red-600 hover:underline">Absent</button>
        </div>
      )}

      <div className="space-y-2">
        {batch?.students.length === 0 && <p className="text-sm text-muted-foreground">No approved students in this batch.</p>}
        {batch?.students.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <span className="text-sm font-medium">{s.name}</span>
            <div className="flex gap-1">
              {STATUSES.map((st) => {
                const active = (marks[s.id] ?? "") === st.value;
                const Icon = st.icon;
                return (
                  <button key={st.value} type="button"
                    onClick={() => setMarks((m) => ({ ...m, [s.id]: st.value }))}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      active ? st.on + " border-transparent" : `bg-background border-border ${st.off} hover:bg-muted`}`}>
                    <Icon className="w-3.5 h-3.5" /> {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {batch && batch.students.length > 0 && (
        <button onClick={submit} disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          <Save className="w-4 h-4" /> {pending ? "Saving…" : "Save Attendance"}
        </button>
      )}
    </div>
  );
}
