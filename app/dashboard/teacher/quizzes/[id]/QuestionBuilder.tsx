"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addQuestion } from "../actions";
import type { QuizQuestionType } from "@/lib/supabase/types";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function QuestionBuilder({ quizId }: { quizId: string }) {
  const [type, setType] = useState<QuizQuestionType>("mcq");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOptions(["", ""]);
    setCorrectIdx(0);
  }

  function action(formData: FormData) {
    setError(null);
    formData.set("quiz_id", quizId);
    formData.set("question_type", type);
    if (type === "mcq") {
      options.forEach((o) => formData.append("option_text", o));
      formData.set("correct_option", String.fromCharCode(97 + correctIdx));
    }
    startTransition(async () => {
      try {
        await addQuestion(formData);
        reset();
        (document.getElementById("qb-form") as HTMLFormElement)?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add question");
      }
    });
  }

  return (
    <form id="qb-form" action={action} className="rounded-2xl border border-card-border bg-card shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-sm">Add question</h3>

      <div className="grid sm:grid-cols-[1fr_auto] gap-4">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as QuizQuestionType)} className={inputCls}>
            <option value="mcq">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
            <option value="file_upload">File Upload</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Marks</span>
          <input type="number" name="marks" min={1} defaultValue={1} className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-muted-foreground mb-1.5">Question prompt *</span>
        <textarea name="prompt" required rows={2} className={inputCls} placeholder="Enter the question…" />
      </label>

      {type === "mcq" && (
        <div className="space-y-2">
          <span className="block text-xs font-medium text-muted-foreground">Options (select the correct one)</span>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct_radio" checked={correctIdx === i} onChange={() => setCorrectIdx(i)} />
              <input
                value={opt}
                onChange={(e) => setOptions((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))}
                className={inputCls}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
              />
              {options.length > 2 && (
                <button type="button" onClick={() => { setOptions((p) => p.filter((_, j) => j !== i)); setCorrectIdx(0); }}
                  className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove option">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" onClick={() => setOptions((p) => [...p, ""])}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="w-3 h-3" /> Add option
            </button>
          )}
        </div>
      )}

      {type === "true_false" && (
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Correct answer</span>
          <select name="correct_tf" className={inputCls}>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </label>
      )}

      {(type === "short_answer" || type === "long_answer") && (
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Model answer (used for AI / manual marking)</span>
          <textarea name="correct_answer" rows={type === "long_answer" ? 3 : 1} className={inputCls} placeholder="Expected answer" />
        </label>
      )}

      {type === "file_upload" && (
        <p className="text-xs text-muted-foreground">Students will attach a file link; graded manually.</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
        <Plus className="w-4 h-4" /> {pending ? "Adding…" : "Add question"}
      </button>
    </form>
  );
}
