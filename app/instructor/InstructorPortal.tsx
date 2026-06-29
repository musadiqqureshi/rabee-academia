"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Loader2, LogIn, GraduationCap, Building2, Upload, Copy, CheckCircle2, Clock,
  BadgeCheck, CalendarClock, XCircle, ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCatalog } from "@/hooks/useCatalog";
import { APPLICATION_FEE, STATUS_LABEL, type InstructorApplication } from "@/lib/instructor";
import { submitApplication, submitPayment } from "./actions";
import TestRunner from "./TestRunner";

const BANK = {
  bankName: "Meezan Bank",
  accountTitle: "MUHAMMAD MUSSADDIQ AHMED QURESHI",
  accountId: "68020114723362",
  iban: "PK87MEZN0068020114723362",
  branch: "JHANG RD MUZAFFARGARH BR",
};
const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");
const input = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40";
const label = "block text-xs font-medium text-muted-foreground mb-1.5";

export default function InstructorPortal() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [app, setApp] = useState<InstructorApplication | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setChecked(true); return; }
    setAuthed(true);
    const { data } = await supabase.from("instructor_applications").select("*").eq("user_id", user.id).maybeSingle();
    setApp((data as InstructorApplication) ?? null);
    setChecked(true);
  }
  useEffect(() => { load(); }, []);

  if (!checked) {
    return <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4"><GraduationCap className="w-3.5 h-3.5" /> Instructor Portal</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Become a Rabee Instructor</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
          Apply, pay the {fmt(APPLICATION_FEE)} assessment fee, pass our AI-screened subject test, then interview with our team.
        </p>
      </div>

      {!authed ? (
        <SignInCard />
      ) : !app ? (
        <ApplyForm onDone={load} />
      ) : (
        <Status app={app} onChange={load} />
      )}
    </>
  );
}

function SignInCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <h2 className="text-lg font-bold">Sign in to apply</h2>
      <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-sm mx-auto">Create a free account or sign in to start your instructor application.</p>
      <Link href={`/login?redirectedFrom=${encodeURIComponent("/instructor")}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
        <LogIn className="w-4 h-4" /> Sign in to apply
      </Link>
    </div>
  );
}

function ApplyForm({ onDone }: { onDone: () => void }) {
  const { catalog } = useCatalog();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitApplication(formData);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else onDone();
    });
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
      <h2 className="text-lg font-bold">Your application</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={label}>Full name *</label><input name="full_name" required className={input} /></div>
        <div><label className={label}>Email *</label><input name="email" type="email" required className={input} /></div>
        <div><label className={label}>Phone / WhatsApp</label><input name="phone" type="tel" className={input} placeholder="+92 300 1234567" /></div>
        <div>
          <label className={label}>Subject you want to teach *</label>
          <select name="subject_name" required defaultValue="" className={input}
            onChange={(e) => {
              const slug = catalog.find((c) => c.name === e.target.value)?.slug ?? "";
              (e.target.form?.elements.namedItem("subject_slug") as HTMLInputElement).value = slug;
            }}>
            <option value="" disabled>Select a subject…</option>
            {catalog.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
          <input type="hidden" name="subject_slug" />
        </div>
      </div>
      <div><label className={label}>Qualifications & teaching experience</label><textarea name="qualifications" rows={4} className={input} placeholder="Degrees, certifications, years of teaching, etc." /></div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Continue to payment
      </button>
    </form>
  );
}

function CodeBadge({ code }: { code: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
      <BadgeCheck className="w-4 h-4" /> Application code: <span className="font-mono">{code}</span>
    </div>
  );
}

function Status({ app, onChange }: { app: InstructorApplication; onChange: () => void }) {
  // Payment not submitted yet → show the invoice + receipt upload.
  if (app.status === "submitted") return <PaymentStep app={app} onDone={onChange} />;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CodeBadge code={app.code} />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted">{STATUS_LABEL[app.status]}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Subject: <strong className="text-foreground">{app.subject_name}</strong></p>
      </div>

      {app.status === "payment_submitted" && (
        <Info icon={<Clock className="w-5 h-5 text-amber-500" />} title="Fee under review"
          body="We've received your application and payment. An admin will verify your fee shortly — your assessment test unlocks right after." />
      )}

      {app.status === "test_unlocked" && <TestRunner subject={app.subject_name} onGraded={onChange} />}

      {app.status === "qualified" && (
        <Info icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} title={`You qualified — ${app.score}%! 🎉`}
          body="Congratulations! Our team has been notified and will reach out with your interview date soon." />
      )}
      {app.status === "interview_scheduled" && (
        <Info icon={<CalendarClock className="w-5 h-5 text-primary" />} title="Interview scheduled"
          body={`Your score: ${app.score}%. Interview${app.interview_at ? `: ${new Date(app.interview_at).toLocaleString()}` : " date will be shared with you"}.`} />
      )}
      {app.status === "hired" && (
        <Info icon={<BadgeCheck className="w-5 h-5 text-emerald-500" />} title="Welcome to the team! 🎉"
          body="You've been hired as an instructor. Sign in to your teacher dashboard to get started." />
      )}
      {app.status === "not_qualified" && (
        <Info icon={<XCircle className="w-5 h-5 text-destructive" />} title={`Score: ${app.score}% — below the 70% pass mark`}
          body="Unfortunately you didn't meet the qualifying score this time. You're welcome to strengthen your subject knowledge and reapply in the future." />
      )}
      {app.status === "rejected" && (
        <Info icon={<XCircle className="w-5 h-5 text-destructive" />} title="Application closed"
          body={app.admin_notes || "Your application was not accepted. Please contact us for details."} />
      )}
    </div>
  );
}

function Info({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div><h3 className="font-bold">{title}</h3><p className="text-sm text-muted-foreground mt-1 leading-relaxed">{body}</p></div>
    </div>
  );
}

function PaymentStep({ app, onDone }: { app: InstructorApplication; onDone: () => void }) {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function copyIban() { navigator.clipboard?.writeText(BANK.iban); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) { setError("Please upload your payment screenshot."); return; }
    setError(null);
    const fd = new FormData();
    fd.set("receipt", receipt);
    startTransition(async () => {
      const res = await submitPayment(fd);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else onDone();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Assessment fee</h2>
        <CodeBadge code={app.code} />
      </div>

      <div className="rounded-xl border border-border overflow-hidden mb-5">
        <div className="bg-primary/10 px-4 py-3 flex items-center justify-between"><span className="font-bold text-sm">Invoice</span><span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span></div>
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Instructor assessment</span><span className="font-medium">{app.subject_name}</span></div>
          <div className="flex justify-between border-t border-border pt-2 mt-1 font-bold text-base"><span>Amount Due</span><span>{fmt(app.fee_amount)}</span></div>
        </div>
      </div>

      <h3 className="font-bold mb-2 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Transfer to (Meezan Bank)</h3>
      <div className="bg-muted/40 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
        {[["Bank", BANK.bankName], ["Account Title", BANK.accountTitle], ["Account No.", BANK.accountId], ["Branch", BANK.branch]].map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:justify-between gap-0.5"><span className="text-muted-foreground text-xs">{k}</span><span className="font-semibold text-xs break-all">{v}</span></div>
        ))}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <span className="text-muted-foreground text-xs">IBAN</span>
          <span className="font-mono font-semibold text-xs break-all flex items-center gap-2">{BANK.iban}<button type="button" onClick={copyIban} className="text-primary hover:opacity-80"><Copy className="w-3.5 h-3.5" /></button></span>
        </div>
        {copied && <p className="text-[11px] text-primary text-right">IBAN copied</p>}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={label}>Upload payment screenshot</label>
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
            <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            {receipt ? <p className="text-sm text-primary font-medium">{receipt.name}</p> : <><p className="text-sm text-muted-foreground">Click to upload screenshot</p><p className="text-xs text-muted-foreground/60 mt-0.5">JPG, PNG or PDF</p></>}
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={pending} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
          {pending && <Loader2 className="w-4 h-4 animate-spin" />} Submit payment for verification
        </button>
        <p className="text-[11px] text-muted-foreground text-center">Your test unlocks once an admin verifies the fee.</p>
      </form>
    </div>
  );
}
