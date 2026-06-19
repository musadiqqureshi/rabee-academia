"use client";

import { useState } from "react";
import { X, Sparkles, Zap } from "lucide-react";

export default function TopBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-primary/90 via-accent/80 to-primary/90 text-white text-xs">
      <div className="flex items-stretch divide-x divide-white/20">
        {/* Announcement 1 — July 2026 batch */}
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2">
          <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
          <span>
            <span className="font-semibold">July 2026 Batch Now Open</span>
            <span className="opacity-80"> — Seats filling fast across FSc, A/O Levels, BS &amp; MS</span>
          </span>
        </div>

        {/* Divider dot */}
        <div className="hidden sm:flex items-center px-3 opacity-40 text-base leading-none">·</div>

        {/* Announcement 2 — AI Mastery (highlighted) */}
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10">
          <Zap className="w-3 h-3 shrink-0 text-yellow-300 animate-pulse" />
          <span>
            <span className="font-bold text-yellow-300">AI Mastery Course</span>
            <span className="opacity-90"> — Announcement coming soon. Stay tuned!</span>
          </span>
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
