"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Building2, Upload, Copy, LogIn, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PRICE_ACTUAL, PRICE_LAUNCH, type Lang } from "@/lib/quranContent";
import { submitEnrollment } from "../../enroll/actions";

// Meezan Bank — Rabee Academia (same account as the main enrol flow).
const BANK = {
  bankName: "Meezan Bank",
  accountTitle: "MUHAMMAD MUSSADDIQ AHMED QURESHI",
  accountId: "68020114723362",
  iban: "PK87MEZN0068020114723362",
  branch: "JHANG RD MUZAFFARGARH BR",
};

const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

const TR = {
  en: {
    heading: "Enroll in this course",
    signinTitle: "Sign in to enroll",
    signinBody: "Create a free account or sign in to enroll and receive your invoice. It takes a moment.",
    signin: "Sign in to enroll",
    staff: "You're signed in as staff — only student accounts can enroll.",
    name: "Full name", email: "Email", phone: "Phone / WhatsApp",
    invoice: "Payment Invoice", student: "Student", course: "Course",
    courseFee: "Course fee", launch: "Launch offer", amountDue: "Amount Due",
    transferTo: "Transfer to (Meezan Bank)", bank: "Bank", title: "Account Title",
    accountNo: "Account No.", branch: "Branch", ibanCopied: "IBAN copied",
    uploadLabel: "Upload payment screenshot", uploadHint: "JPG, PNG or PDF",
    uploadCta: "Click to upload screenshot", submit: "Submit for Admin Verification",
    needReceipt: "Please upload your payment screenshot.",
    successTitle: "Enrollment Submitted!",
    successBody: "Our admin team will verify your payment and assign a teacher. Track the status in your dashboard.",
    goDashboard: "Go to My Courses",
    err: "Something went wrong.",
  },
  ur: {
    heading: "اس کورس میں داخلہ لیں",
    signinTitle: "داخلے کے لیے سائن اِن کریں",
    signinBody: "داخلہ لینے اور انوائس حاصل کرنے کے لیے مفت اکاؤنٹ بنائیں یا سائن اِن کریں۔ بس ایک لمحہ لگے گا۔",
    signin: "داخلے کے لیے سائن اِن کریں",
    staff: "آپ اسٹاف کے طور پر سائن اِن ہیں — صرف طالب علم اکاؤنٹس داخلہ لے سکتے ہیں۔",
    name: "پورا نام", email: "ای میل", phone: "فون / واٹس ایپ",
    invoice: "ادائیگی انوائس", student: "طالب علم", course: "کورس",
    courseFee: "کورس فیس", launch: "افتتاحی پیشکش", amountDue: "قابلِ ادائیگی رقم",
    transferTo: "یہاں منتقل کریں (میزان بینک)", bank: "بینک", title: "اکاؤنٹ ٹائٹل",
    accountNo: "اکاؤنٹ نمبر", branch: "برانچ", ibanCopied: "آئی بان کاپی ہو گیا",
    uploadLabel: "ادائیگی کا اسکرین شاٹ اپ لوڈ کریں", uploadHint: "JPG، PNG یا PDF",
    uploadCta: "اسکرین شاٹ اپ لوڈ کرنے کے لیے کلک کریں", submit: "تصدیق کے لیے جمع کرائیں",
    needReceipt: "براہِ کرم ادائیگی کا اسکرین شاٹ اپ لوڈ کریں۔",
    successTitle: "داخلہ جمع ہو گیا!",
    successBody: "ہماری ایڈمن ٹیم آپ کی ادائیگی کی تصدیق کر کے استاد تفویض کرے گی۔ اسٹیٹس اپنے ڈیش بورڈ میں دیکھیں۔",
    goDashboard: "میرے کورسز پر جائیں",
    err: "کچھ غلط ہو گیا۔",
  },
} as const;

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function QuranEnrollForm({ slug, courseName, lang = "en" }: { slug: string; courseName: string; lang?: Lang }) {
  const t = TR[lang];
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setChecked(true); return; }
      setAuthed(true);
      setEmail(user.email ?? "");
      const { data: profile } = await supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).maybeSingle();
      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      setIsStudent((profile?.role ?? "student") === "student");
      setChecked(true);
    });
  }, []);

  function copyIban() {
    navigator.clipboard?.writeText(BANK.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) { setError(t.needReceipt); return; }
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("course_name", courseName);
    fd.set("type", "regular");
    fd.set("full_name", fullName);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("pay_method", "iban");
    fd.set("receipt", receipt);
    const res = await submitEnrollment(fd);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? t.err); return; }
    setDone(true);
  }

  if (!checked) {
    return <div className="rounded-2xl border border-border bg-card/70 p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 grid place-items-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8" /></div>
        <h3 className="text-xl font-extrabold">{t.successTitle}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{t.successBody}</p>
        <Link href="/dashboard/student/subjects" className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90">
          {t.goDashboard} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-8 text-center">
        <h3 className="text-lg font-bold">{t.signinTitle}</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-sm mx-auto">{t.signinBody}</p>
        <Link href={`/login?redirectedFrom=${encodeURIComponent(`/quran-learning/${slug}`)}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90">
          <LogIn className="w-4 h-4" /> {t.signin}
        </Link>
      </div>
    );
  }

  if (!isStudent) {
    return <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-foreground/80 text-center">{t.staff}</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 md:p-8">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.name}</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} /></div>
        <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} /></div>
        <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.phone}</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} /></div>
      </div>

      {/* Invoice */}
      <div className="rounded-xl border border-border overflow-hidden mb-5">
        <div className="bg-emerald-500/10 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm">{t.invoice}</span>
          <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{t.student}</span><span className="font-medium">{fullName || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t.course}</span><span className="font-medium">{courseName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t.courseFee}</span><span>{fmt(PRICE_ACTUAL)}</span></div>
          <div className="flex justify-between text-emerald-600 font-medium"><span>{t.launch}</span><span>−{fmt(PRICE_ACTUAL - PRICE_LAUNCH)}</span></div>
          <div className="flex justify-between border-t border-border pt-2 mt-1 font-bold text-base"><span>{t.amountDue}</span><span>{fmt(PRICE_LAUNCH)}</span></div>
        </div>
      </div>

      {/* Bank details */}
      <h3 className="font-bold mb-2 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-500" /> {t.transferTo}</h3>
      <div className="bg-muted/40 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
        {[[t.bank, BANK.bankName], [t.title, BANK.accountTitle], [t.accountNo, BANK.accountId], [t.branch, BANK.branch]].map(([label, value]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="font-semibold text-xs break-all">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <span className="text-muted-foreground text-xs">IBAN</span>
          <span className="font-mono font-semibold text-xs break-all flex items-center gap-2">
            {BANK.iban}
            <button type="button" onClick={copyIban} className="text-emerald-600 hover:opacity-80" aria-label="Copy IBAN"><Copy className="w-3.5 h-3.5" /></button>
          </span>
        </div>
        {copied && <p className="text-[11px] text-emerald-600 text-end">{t.ibanCopied}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.uploadLabel}</label>
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative">
            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
            <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            {receipt ? <p className="text-sm text-emerald-600 font-medium">{receipt.name}</p> : <><p className="text-sm text-muted-foreground">{t.uploadCta}</p><p className="text-xs text-muted-foreground/60 mt-0.5">{t.uploadHint}</p></>}
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} {t.submit}
        </button>
      </form>
    </div>
  );
}
