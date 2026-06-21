"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Loader2, Printer, Sparkles, Crown, X, ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "@/components/Markdown";

const input = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";

interface Spec {
  subject: string; grade: string; topics: string; count: string;
  difficulty: string; totalMarks: string; questionTypes: string; language: string;
  institution: string; examTitle: string; timeAllowed: string;
}

const EMPTY: Spec = {
  subject: "", grade: "", topics: "", count: "10",
  difficulty: "mixed", totalMarks: "20", questionTypes: "5 MCQ, 3 short, 2 long",
  language: "English", institution: "", examTitle: "", timeAllowed: "",
};

export default function PaperMakerClient() {
  const [spec, setSpec] = useState<Spec>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paper, setPaper] = useState<string | null>(null);
  const [docSpec, setDocSpec] = useState<Spec | null>(null);
  const [answerKey, setAnswerKey] = useState<string>("");
  const [showKey, setShowKey] = useState(false);
  const [upgrade, setUpgrade] = useState(false);

  function set<K extends keyof Spec>(k: K, v: string) {
    setSpec((s) => ({ ...s, [k]: v }));
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setPaper(null);
    setAnswerKey("");
    try {
      const res = await fetch("/api/ai/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      const json = await res.json();
      if (res.status === 402) { setUpgrade(true); return; }
      if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
      setPaper(json.paper ?? "");
      setDocSpec(spec);
      setAnswerKey(json.key ?? "");
      setShowKey(false);
      setTimeout(() => document.getElementById("paper-result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Print isolation: only the paper area is sent to the printer. */}
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #paper-print-area, #paper-print-area * { visibility: visible !important; }
        #paper-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: none !important; box-shadow: none !important; }
        .no-print { display: none !important; }
      }`}</style>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Intake form */}
        <form onSubmit={generate} className="no-print bg-card border border-border rounded-2xl p-5 space-y-3 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary grid place-items-center"><FileText className="w-4 h-4" /></div>
            <p className="font-semibold text-sm">Paper details</p>
          </div>

          <div><label className={labelCls}>Subject *</label><input required className={input} value={spec.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Physics" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Grade / level *</label><input required className={input} value={spec.grade} onChange={(e) => set("grade", e.target.value)} placeholder="FSc Part 1" /></div>
            <div><label className={labelCls}>Language *</label>
              <select className={input} value={spec.language} onChange={(e) => set("language", e.target.value)}>
                <option>English</option><option>Urdu</option>
              </select>
            </div>
          </div>
          <div><label className={labelCls}>Topic(s) *</label><input required className={input} value={spec.topics} onChange={(e) => set("topics", e.target.value)} placeholder="Kinematics, Newton's laws" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}># Questions *</label><input required type="number" min={1} className={input} value={spec.count} onChange={(e) => set("count", e.target.value)} /></div>
            <div><label className={labelCls}>Total marks *</label><input required type="number" min={1} className={input} value={spec.totalMarks} onChange={(e) => set("totalMarks", e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>Difficulty *</label>
            <select className={input} value={spec.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed">Mixed</option>
            </select>
          </div>
          <div><label className={labelCls}>Question types & counts *</label><input required className={input} value={spec.questionTypes} onChange={(e) => set("questionTypes", e.target.value)} placeholder="5 MCQ, 3 short, 2 long" /></div>

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-1">Optional details</summary>
            <div className="space-y-3 pt-2">
              <div><label className={labelCls}>Institution name</label><input className={input} value={spec.institution} onChange={(e) => set("institution", e.target.value)} placeholder="Rabee Academia" /></div>
              <div><label className={labelCls}>Exam title</label><input className={input} value={spec.examTitle} onChange={(e) => set("examTitle", e.target.value)} placeholder="First Term Examination" /></div>
              <div><label className={labelCls}>Time allowed</label><input className={input} value={spec.timeAllowed} onChange={(e) => set("timeAllowed", e.target.value)} placeholder="2 hours" /></div>
            </div>
          </details>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Paper</>}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Free: 1 paper per day · Pro: unlimited</p>
        </form>

        {/* Result */}
        <div id="paper-result" className="min-h-[300px]">
          {!paper && !loading && (
            <div className="no-print h-full min-h-[300px] grid place-items-center text-center bg-card/40 border border-dashed border-border rounded-2xl p-10">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-3"><FileText className="w-7 h-7" /></div>
                <p className="font-semibold">Your generated paper appears here</p>
                <p className="text-sm text-muted-foreground mt-1">Fill in the details and hit Generate. You can print or save it as a PDF.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="no-print h-full min-h-[300px] grid place-items-center text-center">
              <div className="text-muted-foreground inline-flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm">Crafting your exam paper…</p>
              </div>
            </div>
          )}

          {paper && (
            <div className="space-y-4">
              <div className="no-print flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Paper ready — print or save as PDF.</p>
                <button onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>

              {/* Printable document */}
              <div id="paper-print-area" className="bg-white text-black rounded-xl border border-border p-8 shadow-sm">
                {docSpec && (
                  <div className="mb-6">
                    <div className="text-center space-y-0.5">
                      <h1 className="text-2xl font-extrabold tracking-tight">{docSpec.institution.trim() || "Rabee Academia"}</h1>
                      <p className="text-base font-semibold">{docSpec.examTitle.trim() || `${docSpec.subject} Examination`}</p>
                      <p className="text-sm">{docSpec.subject}{docSpec.grade ? ` — ${docSpec.grade}` : ""}</p>
                      {docSpec.topics.trim() && <p className="text-xs text-black/60">Topic: {docSpec.topics}</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-y-2 border-black/80 py-1.5 text-sm font-semibold">
                      <span>Time Allowed: {docSpec.timeAllowed.trim() || "____"}</span>
                      <span>Name: ______________________</span>
                      <span>Total Marks: {docSpec.totalMarks}</span>
                    </div>
                  </div>
                )}
                <Markdown content={paper} />
                <p className="mt-10 pt-3 border-t border-black/10 text-[11px] italic text-black/50">Made with Rabee&apos;s AI</p>
              </div>

              {/* Answer key — viewable below the download button */}
              {answerKey && (
                <div className="no-print">
                  <button onClick={() => setShowKey((v) => !v)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
                    {showKey ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showKey ? "Hide answer key" : "Show answer key"}
                  </button>
                  {showKey && (
                    <div className="mt-3 bg-card border border-border rounded-xl p-6">
                      <Markdown content={answerKey} />
                    </div>
                  )}
                </div>
              )}

              <div className="no-print">
                <button onClick={() => { setPaper(null); setAnswerKey(""); setError(null); }}
                  className="text-sm text-primary hover:underline">← Generate another paper</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade modal (daily free limit reached) */}
      {upgrade && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setUpgrade(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setUpgrade(false)} aria-label="Close" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white grid place-items-center mx-auto mb-4"><Crown className="w-7 h-7" /></div>
            <h3 className="text-xl font-extrabold mb-1">You&apos;ve used today&apos;s free paper</h3>
            <p className="text-sm text-muted-foreground mb-5">Upgrade to <strong>Rabee&apos;s AI Pro</strong> for <strong>unlimited</strong> exam papers, answer keys and PDF downloads.</p>
            <div className="rounded-xl border border-border p-4 mb-5">
              <p className="text-3xl font-extrabold">PKR 3,000<span className="text-sm font-medium text-muted-foreground">/month</span></p>
              <p className="text-xs text-muted-foreground mt-1">Unlimited papers · priority generation</p>
            </div>
            <Link href="/products/pro" className="block w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">Upgrade to Pro</Link>
            <button onClick={() => setUpgrade(false)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Maybe later</button>
          </div>
        </div>
      )}
    </>
  );
}
