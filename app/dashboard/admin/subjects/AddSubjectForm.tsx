"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createSubject } from "./actions";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function AddSubjectForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90">
        <Plus className="w-4 h-4" /> Add Subject
      </button>
    );
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createSubject(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add subject");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Add Subject</h3>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form action={action} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Name *</span><input name="name" required className={inputCls} placeholder="FSc Physics" /></label>
            <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Level</span><input name="level" className={inputCls} placeholder="FSc Level" /></label>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Regular price (PKR)</span><input type="number" name="regular_price" min={0} defaultValue={7000} className={inputCls} /></label>
            <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Weekend price (PKR)</span><input type="number" name="weekend_price" min={0} defaultValue={5500} className={inputCls} /></label>
            <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Lessons</span><input type="number" name="lessons" min={0} defaultValue={40} className={inputCls} /></label>
          </div>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Slug (optional)</span><input name="slug" className={inputCls} placeholder="auto-generated from name" /></label>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Description</span><textarea name="description" rows={2} className={inputCls} /></label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {pending ? "Adding…" : "Add Subject"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
