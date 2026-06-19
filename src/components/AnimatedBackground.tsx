"use client";

import { useMemo } from "react";

/**
 * Fixed, GPU-cheap animated background: drifting aurora gradient blobs plus a
 * handful of rising particles. Lives behind all page content (z-index -10) and
 * shows through the semi-transparent / transparent sections.
 */
export default function AnimatedBackground() {
  // Deterministic particle field (stable between SSR and client to avoid hydration mismatch).
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const r = seed / 233280;
        const size = 3 + Math.round(r * 5); // 3–8px
        return {
          left: `${Math.round(((i * 4.5) % 100) + r * 3)}%`,
          size,
          duration: `${9 + Math.round(r * 8)}s`, // 9–17s — lively but smooth
          delay: `${-Math.round(r * 16)}s`,
          drift: `${Math.round((r - 0.5) * 80)}px`,
          opacity: 0.35 + r * 0.4,
        };
      }),
    []
  );

  return (
    <div className="fx-bg" aria-hidden="true">
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <div className="aurora aurora-3" />
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
            // @ts-expect-error custom property consumed by the keyframe
            "--drift": p.drift,
          }}
        />
      ))}
    </div>
  );
}
