"use client";

import { useState } from "react";
import { X, Sparkles, Zap } from "lucide-react";

const items = [
  {
    icon: <Sparkles className="w-3 h-3 shrink-0 opacity-90" />,
    text: "🎓 July 2026 Batch Now Open — Seats filling fast across FSc, A/O Levels, BS & MS programs",
    highlight: false,
  },
  {
    icon: <Zap className="w-3 h-3 shrink-0 text-yellow-300" />,
    text: "🚀 NEW: AI Mastery Course launched — FREE 2-week intensive, weekends, starts July 2026. Only 50 seats!",
    highlight: true,
  },
  {
    icon: <Sparkles className="w-3 h-3 shrink-0 opacity-90" />,
    text: "🎉 Limited offer: 20% OFF your first subject enrollment",
    highlight: false,
  },
];

// Duplicate for seamless loop
const ticker = [...items, ...items, ...items, ...items];

export default function TopBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary via-accent/90 to-primary text-white text-xs overflow-hidden h-8 flex items-center">
      <div className="flex animate-scroll whitespace-nowrap">
        {ticker.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 mx-10 ${item.highlight ? "text-yellow-300 font-semibold" : "opacity-90"}`}
          >
            {item.icon}
            {item.text}
            <span className="mx-6 opacity-30">|</span>
          </span>
        ))}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors z-10 bg-gradient-to-r from-transparent to-primary/80"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
