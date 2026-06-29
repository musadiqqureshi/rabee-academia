"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { PublicTest } from "@/lib/instructor";

interface Result { total: number; mcqPct: number; longPct: number; passed: boolean; passMark: number }

export default function TestRunner({ subject, onGraded }: { subject: string; onGraded: () => void }) {
  const [phase, setPhase] = useState<"intro" | "taking" | "result">("intro");
  const [test, setTest] = useState<PublicTest | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);
  const [longAnswers, setLongAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function start() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/instructor/test/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Could not start the test."); return; }
      const t = json.test as PublicTest;
      setTest(t);
      setMcqAnswers(new Array(t.mcqs.length).fill(-1));
      setLongAnswers(new Array(t.long.length).fill(""));
      setPhase("taking");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function submit() {
    if (!test) return;
    if (mcqAnswers.includes(-1) || longAnswers.some((a) => !a.trim())) {
      setError("Please answer every question (all MCQs and both long questions) before submitting.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/instructor/test/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mcqAnswers, longAnswers }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Could not submit your test."); return; }
      setResult(json as Result);
      setPhase("result");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  if (phase === "result" && result) {
    const ok = result.passed;
    return (
      <div className={`rounded-2xl border p-8 text-center ${ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-destructive/30 bg-destructive/10"}`}>
        <div className={`w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 ${ok ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"}`}>
          {ok ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>
        <h3 className="text-2xl font-extrabold">{result.total}%</h3>
        <p className="text-sm text-muted-foreground mt-1">MCQs {result.mcqPct}% · Long answers {result.longPct}% · Pass mark {result.passMark}%</p>
        <p className="mt-4 font-semibold">{ok ? "🎉 You qualified! Admins have been notified to schedule your interview." : "You didn't reach the 70% pass mark this time."}</p>
        <button onClick={onGraded} className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">View my status</button>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Your assessment test</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          A <strong className="text-foreground">hard</strong>, AI-generated {subject} exam: multiple-choice questions plus 2 long questions.
          You need <strong className="text-foreground">70%</strong> (MCQs + long answers combined) to qualify for an interview.
          Answer carefully — the test can only be taken once.
        </p>
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/80">Make sure you have time to finish in one sitting. Don&apos;t refresh once you start.</p>
        </div>
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        <button onClick={start} disabled={loading} className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing your test…</> : <>Start Test</>}
        </button>
      </div>
    );
  }

  // taking
  return (
    <div className="space-y-5">
      {test!.mcqs.map((q, qi) => (
        <div key={qi} className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold text-sm mb-3"><span className="text-primary">Q{qi + 1}.</span> {q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <label key={oi} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${mcqAnswers[qi] === oi ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                <input type="radio" name={`q${qi}`} checked={mcqAnswers[qi] === oi}
                  onChange={() => setMcqAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))} className="accent-primary" />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      {test!.long.map((q, li) => (
        <div key={li} className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold text-sm mb-3"><span className="text-primary">Long Q{li + 1}.</span> {q.prompt}</p>
          <textarea rows={6} value={longAnswers[li]} onChange={(e) => setLongAnswers((a) => a.map((v, i) => (i === li ? e.target.value : v)))}
            placeholder="Write your detailed answer…" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <button onClick={submit} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Grading…</> : <>Submit Test</>}
      </button>
    </div>
  );
}
