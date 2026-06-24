"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Bell } from "lucide-react";
import { joinWaitlist } from "./actions";

export default function WaitlistForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 text-emerald-600 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" /> You&apos;re on the list — we&apos;ll email you at launch!
      </div>
    );
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await joinWaitlist(formData);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else setDone(true);
    });
  }

  return (
    <form action={action} className="w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <input name="name" placeholder="Your name (optional)"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        <input name="email" type="email" required placeholder="you@example.com"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        <button type="submit" disabled={pending}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 shrink-0">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Join waitlist
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <p className="text-[11px] text-muted-foreground mt-2">Get notified at launch + your first-100 discount. No spam.</p>
    </form>
  );
}
