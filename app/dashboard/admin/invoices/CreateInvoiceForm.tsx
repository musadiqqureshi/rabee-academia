"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createInvoice } from "./actions";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function CreateInvoiceForm({
  students, subjects,
}: {
  students: { id: string; label: string }[];
  subjects: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90">
        <Plus className="w-4 h-4" /> New Invoice
      </button>
    );
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createInvoice(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create invoice");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Create Invoice</h3>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Student *</span>
            <select name="student_id" required className={inputCls} defaultValue="">
              <option value="" disabled>Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Category</span>
            <select name="category" className={inputCls} defaultValue="monthly_fee">
              <option value="registration">Course Registration</option>
              <option value="monthly_fee">Monthly Fee</option>
              <option value="special_class">Special Class</option>
              <option value="exam_fee">Exam Fee</option>
            </select>
          </label>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Subject (optional)</span>
            <select name="subject_id" className={inputCls} defaultValue="">
              <option value="">—</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Amount (PKR) *</span>
            <input type="number" name="amount_pkr" min={0} required className={inputCls} placeholder="5000" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Due date</span>
            <input type="date" name="due_date" className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Description</span>
          <input name="description" className={inputCls} placeholder="e.g. June 2026 tuition fee" />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={pending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
            {pending ? "Creating…" : "Create Invoice"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
        </div>
      </form>
    </div>
  );
}
