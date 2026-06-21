"use client";

import Link from "next/link";
import { Crown, X } from "lucide-react";

// Shown when a free user hits the once-a-day limit for any Rabee's AI tool.
export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white grid place-items-center mx-auto mb-4"><Crown className="w-7 h-7" /></div>
        <h3 className="text-xl font-extrabold mb-1">You&apos;ve used today&apos;s free generation</h3>
        <p className="text-sm text-muted-foreground mb-5">Upgrade to <strong>Rabee&apos;s AI Pro</strong> for <strong>unlimited</strong> use of every AI tool.</p>
        <div className="rounded-xl border border-border p-4 mb-5">
          <p className="text-3xl font-extrabold">PKR 3,000<span className="text-sm font-medium text-muted-foreground">/month</span></p>
          <p className="text-xs text-muted-foreground mt-1">Unlimited papers, grading, notes, plans &amp; quizzes</p>
        </div>
        <Link href="/products/pro" className="block w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">Upgrade to Pro</Link>
        <button onClick={onClose} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Maybe later</button>
      </div>
    </div>
  );
}
