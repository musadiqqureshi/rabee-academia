"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Loader2 } from "lucide-react";
import { generateQuizWithAI } from "./actions";

interface BatchOption { id: string; label: string }
const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function AIQuizForm({ batches }: { batches: BatchOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (batches.length === 0) return null;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5">
        <Sparkles className="w-4 h-4" /> Generate with AI
      </button>
    );
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const id = await generateQuizWithAI(formData);
        router.push(`/dashboard/teacher/quizzes/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generate Quiz with AI</h3>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <form action={action} className="space-y-3">
        <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Topic *</span>
          <input name="topic" required className={inputCls} placeholder="e.g. Newton's Laws of Motion" /></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Batch *</span>
            <select name="batch_id" required className={inputCls} defaultValue={batches[0].id}>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select></label>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Level</span>
            <select name="level" className={inputCls} defaultValue="FSc">
              {["FSc", "O Level", "A Level", "BS", "MS"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Number of questions</span>
            <input type="number" name="count" min={1} max={20} defaultValue={5} className={inputCls} /></label>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Marks per question</span>
            <input type="number" name="marks_each" min={1} defaultValue={1} className={inputCls} /></label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Quiz</>}
        </button>
      </form>
    </div>
  );
}
