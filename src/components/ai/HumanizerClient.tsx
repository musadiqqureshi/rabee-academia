"use client";

import { useState } from "react";
import { Loader2, Sparkles, Printer, Copy, Check } from "lucide-react";
import Markdown from "@/components/Markdown";
import UpgradeModal from "@/components/ai/UpgradeModal";
import EnrolPerk from "@/components/ai/EnrolPerk";

const DAILY_LIMIT = 2000;

export default function HumanizerClient() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [copied, setCopied] = useState(false);

  const words = (text.trim().match(/\S+/g) ?? []).length;

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/ai/humanizer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (res.status === 402) { setError(json.error ?? null); setRemaining(json.remaining ?? 0); setUpgrade(true); return; }
      if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
      setResult(json.text ?? "");
      setRemaining(typeof json.remaining === "number" ? json.remaining : null);
      setTimeout(() => document.getElementById("humanizer-result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard?.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #paper-print-area, #paper-print-area * { visibility: visible !important; }
        #paper-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: none !important; box-shadow: none !important; }
        .no-print { display: none !important; }
      }`}</style>

      <form onSubmit={run} className="no-print space-y-3">
        <EnrolPerk />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">Paste AI text to humanize</label>
            <span className={`text-[11px] font-medium ${words > DAILY_LIMIT ? "text-destructive" : "text-muted-foreground"}`}>{words} words{remaining !== null && ` · ${remaining} free left today`}</span>
          </div>
          <textarea required value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here…"
            className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          <p className="text-[11px] text-muted-foreground mt-1">Free: up to {DAILY_LIMIT.toLocaleString()} words per day · Pro: unlimited</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading || !text.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Humanizing…</> : <><Sparkles className="w-4 h-4" /> Humanize Text</>}
        </button>
      </form>

      <div id="humanizer-result" className="mt-6">
        {result && (
          <div className="space-y-3">
            <div className="no-print flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Humanized — copy or print.</p>
              <div className="flex items-center gap-2">
                <button onClick={copy} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
                  {copied ? <><Check className="w-4 h-4 text-green-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
              </div>
            </div>
            <div id="paper-print-area" className="bg-white text-black rounded-xl border border-border p-8 shadow-sm">
              <Markdown content={result} />
              <p className="mt-10 pt-3 border-t border-black/10 text-[11px] italic text-black/50">Made with Rabee&apos;s AI</p>
            </div>
          </div>
        )}
      </div>

      {upgrade && <UpgradeModal onClose={() => setUpgrade(false)} />}
    </>
  );
}
