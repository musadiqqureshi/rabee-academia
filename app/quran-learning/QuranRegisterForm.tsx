"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, BookOpen } from "lucide-react";
import type { Lang } from "@/lib/quranContent";
import { submitQuranRegistration } from "./actions";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";

const TR = {
  en: {
    studentName: "Student name", parentName: "Parent / guardian name", optional: "Optional",
    age: "Age", gender: "Gender", select: "Select…", male: "Male", female: "Female",
    country: "Country", timezone: "Time zone", whatsapp: "WhatsApp number", email: "Email",
    level: "Current Quran level", language: "Preferred language", timing: "Preferred class timing",
    goal: "Learning goal", submit: "Start Your Quran Journey",
    note: "Free assessment · No payment required to register. We'll reach out on WhatsApp.",
    levels: ["Complete beginner", "Noorani Qaida", "Nazra (reading)", "Tajweed", "Hifz (memorization)"],
    languages: ["English", "Urdu", "Arabic", "Other"],
    doneTitle: "Registration received 🌙",
    doneBody: "Assalamu Alaikum! Our team will contact you shortly on WhatsApp to arrange your free assessment and assign a qualified teacher.",
    err: "Something went wrong.",
  },
  ur: {
    studentName: "طالب علم کا نام", parentName: "والد / سرپرست کا نام", optional: "اختیاری",
    age: "عمر", gender: "جنس", select: "منتخب کریں…", male: "مرد", female: "خاتون",
    country: "ملک", timezone: "ٹائم زون", whatsapp: "واٹس ایپ نمبر", email: "ای میل",
    level: "موجودہ قرآن سطح", language: "پسندیدہ زبان", timing: "پسندیدہ کلاس وقت",
    goal: "تعلیمی مقصد", submit: "اپنا قرآن سفر شروع کریں",
    note: "مفت جائزہ · رجسٹریشن کے لیے کوئی ادائیگی نہیں۔ ہم واٹس ایپ پر رابطہ کریں گے۔",
    levels: ["بالکل مبتدی", "نورانی قاعدہ", "ناظرہ", "تجوید", "حفظ"],
    languages: ["انگریزی", "اردو", "عربی", "دیگر"],
    doneTitle: "رجسٹریشن موصول ہو گئی 🌙",
    doneBody: "السلام علیکم! ہماری ٹیم جلد ہی واٹس ایپ پر آپ سے رابطہ کرے گی تاکہ مفت جائزہ اور مستند استاد کا انتظام کیا جا سکے۔",
    err: "کچھ غلط ہو گیا۔",
  },
} as const;

export default function QuranRegisterForm({ lang = "en" }: { lang?: Lang }) {
  const t = TR[lang];
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitQuranRegistration(formData);
      if (!res.ok) setError(res.error ?? t.err);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 grid place-items-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7" /></div>
        <h3 className="text-lg font-bold">{t.doneTitle}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{t.doneBody}</p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 md:p-8">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>{t.studentName} *</label><input name="student_name" required className={field} /></div>
        <div><label className={labelCls}>{t.parentName}</label><input name="parent_name" placeholder={t.optional} className={field} /></div>
        <div><label className={labelCls}>{t.age}</label><input name="age" type="number" min={3} max={99} className={field} /></div>
        <div><label className={labelCls}>{t.gender}</label>
          <select name="gender" defaultValue="" className={field}>
            <option value="" disabled>{t.select}</option><option value="Male">{t.male}</option><option value="Female">{t.female}</option>
          </select>
        </div>
        <div><label className={labelCls}>{t.country}</label><input name="country" className={field} /></div>
        <div><label className={labelCls}>{t.timezone}</label><input name="timezone" placeholder="GMT+1" className={field} /></div>
        <div><label className={labelCls}>{t.whatsapp} *</label><input name="whatsapp" type="tel" required placeholder="+44 7700 900000" className={field} /></div>
        <div><label className={labelCls}>{t.email} *</label><input name="email" type="email" required placeholder="you@example.com" className={field} /></div>
        <div><label className={labelCls}>{t.level}</label>
          <select name="level" defaultValue="" className={field}>
            <option value="" disabled>{t.select}</option>
            {t.levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>{t.language}</label>
          <select name="language" defaultValue="" className={field}>
            <option value="" disabled>{t.select}</option>
            {t.languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>{t.timing}</label><input name="preferred_timing" className={field} /></div>
        <div><label className={labelCls}>{t.goal}</label><input name="goal" className={field} /></div>
      </div>

      {error && <p className="text-sm text-destructive mt-4">{error}</p>}

      <button type="submit" disabled={pending}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />} {t.submit}
      </button>
      <p className="text-[11px] text-muted-foreground text-center mt-3">{t.note}</p>
    </form>
  );
}
