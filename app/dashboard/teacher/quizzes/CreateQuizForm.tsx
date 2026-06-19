"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createQuiz } from "./actions";

interface BatchOption { id: string; label: string }

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function CreateQuizForm({ batches }: { batches: BatchOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (batches.length === 0) {
    return <p className="text-sm text-muted-foreground">You need an assigned batch before creating quizzes.</p>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90">
        <Plus className="w-4 h-4" /> New Quiz
      </button>
    );
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const id = await createQuiz(formData);
        router.push(`/dashboard/teacher/quizzes/${id}`); // jump straight to the question builder
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create quiz");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Create Quiz</h3>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</span>
            <input name="title" required className={inputCls} placeholder="Chapter 3 — Kinematics quiz" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Batch *</span>
            <select name="batch_id" required className={inputCls} defaultValue={batches[0].id}>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Description</span>
          <textarea name="description" rows={2} className={inputCls} />
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Time limit (min)</span>
            <input type="number" name="time_limit_minutes" min={0} className={inputCls} placeholder="e.g. 30" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Attempt limit</span>
            <input type="number" name="attempt_limit" min={1} defaultValue={1} className={inputCls} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Passing score (%)</span>
            <input type="number" name="passing_score" min={0} max={100} defaultValue={50} className={inputCls} />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Available from</span>
            <input type="datetime-local" name="available_from" className={inputCls} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Auto-close at</span>
            <input type="datetime-local" name="available_until" className={inputCls} />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Marking</span>
            <select name="grading_mode" className={inputCls} defaultValue="manual">
              <option value="manual">Manual marking</option>
              <option value="ai">AI auto-marking</option>
            </select>
          </label>
          <div className="flex items-end gap-4 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="randomize_questions" /> Random questions</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="randomize_answers" /> Random answers</label>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={pending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
            {pending ? "Creating…" : "Create & add questions"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
        </div>
      </form>
    </div>
  );
}
