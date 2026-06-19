"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createBatch } from "./actions";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function AddBatchForm({
  subjects, teachers,
}: {
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90">
        <Plus className="w-4 h-4" /> Create Batch
      </button>
    );
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createBatch(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create batch");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Create Batch</h3>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        {subjects.length === 0 || teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You need at least one subject and one teacher first.
          </p>
        ) : (
          <form action={action} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Subject *</span>
                <select name="subject_id" required className={inputCls} defaultValue="">
                  <option value="" disabled>Select subject</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Teacher *</span>
                <select name="teacher_id" required className={inputCls} defaultValue="">
                  <option value="" disabled>Select teacher</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Class type</span>
                <select name="class_type" className={inputCls} defaultValue="regular">
                  <option value="regular">Regular</option>
                  <option value="weekend">Weekend</option>
                </select>
              </label>
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Max students</span>
                <input type="number" name="max_students" min={1} defaultValue={30} className={inputCls} />
              </label>
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Meet link</span>
                <input name="meet_link" type="url" className={inputCls} placeholder="https://meet.google.com/…" />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Start date</span>
                <input type="date" name="start_date" className={inputCls} />
              </label>
              <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">End date</span>
                <input type="date" name="end_date" className={inputCls} />
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                {pending ? "Creating…" : "Create Batch"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
