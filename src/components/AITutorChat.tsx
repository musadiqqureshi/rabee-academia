"use client";

import { useRef, useState } from "react";
import { Send, Sparkles, Loader2, GraduationCap } from "lucide-react";
import Markdown from "@/components/Markdown";

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "Explain Newton's second law with an example",
  "Help me plan a 2-week FSc Chemistry revision",
  "What's the difference between mitosis and meiosis?",
  "Give me 3 tips to solve calculus problems faster",
];

export default function AITutorChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
      } else {
        setMessages((m) => [...m, { role: "assistant", content: json.reply }]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[420px] rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary grid place-items-center"><Sparkles className="w-4 h-4" /></div>
        <div>
          <p className="font-semibold text-sm leading-tight">Rabee's AI</p>
          <p className="text-xs text-muted-foreground">Subject help · homework · exam prep</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center"><GraduationCap className="w-7 h-7" /></div>
            <div>
              <p className="font-semibold">Ask me anything about your studies</p>
              <p className="text-sm text-muted-foreground mt-1">I explain concepts step-by-step so you actually learn.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user" ? "bg-primary text-primary-foreground whitespace-pre-wrap" : "bg-muted text-foreground"}`}>
              {m.role === "user" ? m.content : <Markdown content={m.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="grid place-items-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
