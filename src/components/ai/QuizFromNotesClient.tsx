"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import UpgradeModal from "@/components/ai/UpgradeModal";
import EnrolPerk from "@/components/ai/EnrolPerk";

interface Q { q: string; options: string[]; answer: number; explanation: string }

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function QuizFromNotesClient() {
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState("5");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [upgrade, setUpgrade] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true); setQuestions(null); setPicked({}); setSubmitted(false);
    try {
      const res = await fetch("/api/ai/quiz-gen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { subject, count, notes } }),
      });
      const json = await res.json();
      if (res.status === 402) { setUpgrade(true); return; }
      if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
      setQuestions(json.questions ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const score = questions ? questions.reduce((s, q, i) => s + (picked[i] === q.answer ? 1 : 0), 0) : 0;
  const allAnswered = questions ? Object.keys(picked).length === questions.length : false;

  return (
    <>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <form onSubmit={generate} className="bg-card border border-border rounded-2xl p-5 space-y-3 h-fit lg:sticky lg:top-24">
          <EnrolPerk />
          <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label><input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Biology" /></div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1.5"># Questions</label><input type="number" min={3} max={20} className={inputCls} value={count} onChange={(e) => setCount(e.target.value)} /></div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Your notes / topic *</label><textarea required className={`${inputCls} min-h-[160px]`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste a chapter, your notes, or a topic to be tested on…" /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Building quiz…</> : <><Sparkles className="w-4 h-4" /> Generate Quiz</>}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Free: 1 per day · Pro: unlimited</p>
        </form>

        <div className="min-h-[300px]">
          {!questions && !loading && (
            <div className="h-full min-h-[300px] grid place-items-center text-center bg-card/40 border border-dashed border-border rounded-2xl p-10">
              <p className="text-sm text-muted-foreground">Paste your notes and generate a self-test. Answer the questions, then check your score.</p>
            </div>
          )}
          {loading && (
            <div className="h-full min-h-[300px] grid place-items-center">
              <div className="text-muted-foreground inline-flex flex-col items-center gap-3"><Loader2 className="w-7 h-7 animate-spin text-primary" /><p className="text-sm">Writing your quiz…</p></div>
            </div>
          )}
          {questions && (
            <div className="space-y-4">
              {submitted && (
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <p className="font-bold">Score: {score} / {questions.length}</p>
                  <button onClick={() => { setQuestions(null); setPicked({}); setSubmitted(false); }} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><RotateCcw className="w-4 h-4" /> New quiz</button>
                </div>
              )}
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-medium text-sm mb-3">{qi + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const chosen = picked[qi] === oi;
                      const correct = q.answer === oi;
                      let cls = "border-border hover:bg-muted/50";
                      if (submitted) {
                        if (correct) cls = "border-green-500 bg-green-500/10";
                        else if (chosen) cls = "border-destructive bg-destructive/10";
                      } else if (chosen) cls = "border-primary bg-primary/5";
                      return (
                        <button key={oi} type="button" disabled={submitted}
                          onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${cls}`}>
                          <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span>
                          <span className="flex-1">{opt}</span>
                          {submitted && correct && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          {submitted && chosen && !correct && <XCircle className="w-4 h-4 text-destructive" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-2"><strong>Why:</strong> {q.explanation}</p>
                  )}
                </div>
              ))}
              {!submitted && (
                <button onClick={() => setSubmitted(true)} disabled={!allAnswered}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50">
                  {allAnswered ? "Check answers" : "Answer all questions to check"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {upgrade && <UpgradeModal onClose={() => setUpgrade(false)} />}
    </>
  );
}
