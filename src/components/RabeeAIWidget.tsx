"use client";

import { useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import Markdown from "@/components/Markdown";

interface Msg { role: "user" | "assistant"; content: string }

const GREETING = "Hi! I'm Rabee's AI 👋 Ask me about our courses, pricing, the free AI Mastery course, or how to book a free demo.";
const SUGGESTIONS = ["What courses do you offer?", "How much are the fees?", "Tell me about the AI Mastery course", "How do I book a free demo?"];

export default function RabeeAIWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: res.ok ? json.reply : (json.error ?? "Sorry, something went wrong.") }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with Rabee's AI"
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent text-white pl-3 pr-4 py-3 shadow-[0_8px_30px_rgba(37,99,235,0.45)] hover:scale-105 transition-transform"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        <span className="text-sm font-semibold hidden sm:inline">{open ? "Close" : "Ask Rabee's AI"}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-accent text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 grid place-items-center"><Sparkles className="w-4 h-4" /></div>
            <div>
              <p className="font-bold text-sm leading-tight">Rabee&apos;s AI</p>
              <p className="text-[11px] text-white/80">Ask about courses, fees &amp; demos</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="bg-muted rounded-2xl px-3 py-2 text-sm">{GREETING}</div>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-muted/60 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground whitespace-pre-wrap" : "bg-muted text-foreground"}`}>
                  {m.role === "user" ? m.content : <Markdown content={m.content} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="bg-muted rounded-2xl px-3 py-2 text-sm text-muted-foreground inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Typing…</div></div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-2.5 flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…"
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
            <button type="submit" disabled={loading || !input.trim()}
              className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
