"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateScheduleWithAI } from "./actions";

export default function GenerateScheduleButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await generateScheduleWithAI();
        setResult(res);
      } catch {
        setResult({ ok: false, message: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 disabled:opacity-50"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {pending ? "Generating…" : "Generate with AI"}
      </button>
      {result && (
        <p className={`text-xs max-w-xs ${result.ok ? "text-green-500" : "text-red-400"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
