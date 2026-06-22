"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

// Live "seats left" — polls the public seat count so every visitor sees the
// real number update without a refresh.
export default function MasterySeats({ limit, initialLeft }: { limit: number; initialLeft: number }) {
  const [left, setLeft] = useState(initialLeft);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/ai-mastery-seats", { cache: "no-store" });
        const j = await r.json();
        if (alive && typeof j.left === "number") setLeft(j.left);
      } catch { /* keep last value */ }
    };
    load();
    const id = setInterval(load, 12000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5">
      <Users className="w-4 h-4 text-primary" />
      <span className={left <= 5 ? "font-bold text-fuchsia-600" : ""}>{left}</span> of {limit} seats left
    </span>
  );
}
