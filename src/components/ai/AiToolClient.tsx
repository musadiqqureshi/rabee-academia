"use client";

import { useState } from "react";
import { Loader2, Printer, Sparkles } from "lucide-react";
import Markdown from "@/components/Markdown";
import UpgradeModal from "@/components/ai/UpgradeModal";
import EnrolPerk from "@/components/ai/EnrolPerk";

export interface ToolField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  full?: boolean;
  defaultValue?: string;
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

// Generic tool: schema-driven intake form -> markdown result with print + quota.
export default function AiToolClient({
  endpoint, fields, submitLabel = "Generate", printTitle,
}: {
  endpoint: string; fields: ToolField[]; submitLabel?: string; printTitle: string;
}) {
  const init = Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]));
  const [input, setInput] = useState<Record<string, string>>(init);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  function set(name: string, v: string) { setInput((s) => ({ ...s, [name]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true); setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const json = await res.json();
      if (res.status === 402) { setUpgrade(true); return; }
      if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
      setResult(json.text ?? "");
      setTimeout(() => document.getElementById("tool-result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #paper-print-area, #paper-print-area * { visibility: visible !important; }
        #paper-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: none !important; box-shadow: none !important; }
        .no-print { display: none !important; }
      }`}</style>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <form onSubmit={submit} className="no-print bg-card border border-border rounded-2xl p-5 space-y-3 h-fit lg:sticky lg:top-24">
          <EnrolPerk />
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}{f.required && " *"}</label>
              {f.type === "textarea" ? (
                <textarea required={f.required} className={`${inputCls} min-h-[96px]`} value={input[f.name]} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              ) : f.type === "select" ? (
                <select className={inputCls} value={input[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input required={f.required} type={f.type} className={inputCls} value={input[f.name]} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> {submitLabel}</>}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Free: 1 per day · Pro: unlimited</p>
        </form>

        <div id="tool-result" className="min-h-[300px]">
          {!result && !loading && (
            <div className="no-print h-full min-h-[300px] grid place-items-center text-center bg-card/40 border border-dashed border-border rounded-2xl p-10">
              <p className="text-sm text-muted-foreground">Fill in the details and hit <strong>{submitLabel}</strong>. You can print or save the result as a PDF.</p>
            </div>
          )}
          {loading && (
            <div className="no-print h-full min-h-[300px] grid place-items-center">
              <div className="text-muted-foreground inline-flex flex-col items-center gap-3"><Loader2 className="w-7 h-7 animate-spin text-primary" /><p className="text-sm">Working on it…</p></div>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="no-print flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Ready — print or save as PDF.</p>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
              <div id="paper-print-area" className="bg-white text-black rounded-xl border border-border p-8 shadow-sm">
                <p className="text-center text-xs text-black/50 mb-4">{printTitle} · {new Date().toLocaleDateString()}</p>
                <Markdown content={result} />
                <p className="mt-10 pt-3 border-t border-black/10 text-[11px] italic text-black/50">Made with Rabee&apos;s AI</p>
              </div>
              <div className="no-print">
                <button onClick={() => { setResult(null); setError(null); }} className="text-sm text-primary hover:underline">← Generate another</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {upgrade && <UpgradeModal onClose={() => setUpgrade(false)} />}
    </>
  );
}
