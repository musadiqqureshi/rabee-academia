"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, BookOpen } from "lucide-react";
import { submitQuranRegistration } from "./actions";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";

export default function QuranRegisterForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitQuranRegistration(formData);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 grid place-items-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold">Registration received 🌙</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Assalamu Alaikum! Our team will contact you shortly on WhatsApp to arrange your free assessment and assign a qualified teacher.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 md:p-8">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Student name *</label>
          <input name="student_name" required placeholder="e.g. Ayesha Khan" className={field} />
        </div>
        <div>
          <label className={labelCls}>Parent / guardian name</label>
          <input name="parent_name" placeholder="Optional" className={field} />
        </div>
        <div>
          <label className={labelCls}>Age</label>
          <input name="age" type="number" min={3} max={99} placeholder="e.g. 10" className={field} />
        </div>
        <div>
          <label className={labelCls}>Gender</label>
          <select name="gender" defaultValue="" className={field}>
            <option value="" disabled>Select…</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input name="country" placeholder="e.g. United Kingdom" className={field} />
        </div>
        <div>
          <label className={labelCls}>Time zone</label>
          <input name="timezone" placeholder="e.g. GMT+1" className={field} />
        </div>
        <div>
          <label className={labelCls}>WhatsApp number *</label>
          <input name="whatsapp" type="tel" required placeholder="+44 7700 900000" className={field} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input name="email" type="email" required placeholder="you@example.com" className={field} />
        </div>
        <div>
          <label className={labelCls}>Current Quran level</label>
          <select name="level" defaultValue="" className={field}>
            <option value="" disabled>Select…</option>
            <option>Complete beginner</option>
            <option>Noorani Qaida</option>
            <option>Nazra (reading)</option>
            <option>Tajweed</option>
            <option>Hifz (memorization)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Preferred language</label>
          <select name="language" defaultValue="" className={field}>
            <option value="" disabled>Select…</option>
            <option>English</option>
            <option>Urdu</option>
            <option>Arabic</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Preferred class timing</label>
          <input name="preferred_timing" placeholder="e.g. Weekdays after 6 PM" className={field} />
        </div>
        <div>
          <label className={labelCls}>Learning goal</label>
          <input name="goal" placeholder="e.g. Learn Tajweed & memorize Juz 30" className={field} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-4">{error}</p>}

      <button type="submit" disabled={pending}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />} Start Your Quran Journey
      </button>
      <p className="text-[11px] text-muted-foreground text-center mt-3">Free assessment · No payment required to register. We&apos;ll reach out on WhatsApp.</p>
    </form>
  );
}
