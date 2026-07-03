"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Loader2, LogIn, HeartHandshake, CheckCircle2, Clock, XCircle, ListChecks, Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCatalog } from "@/hooks/useCatalog";
import { submitScholarship } from "./actions";

interface App {
  id: string; status: string; awarded_amount: number | null; valid_until: string | null; admin_notes: string | null;
}
const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");
const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40";
const label = "block text-xs font-medium text-muted-foreground mb-1.5";

const PERKS = [
  "Awarded on genuine financial need — not just merit.",
  "A monthly fee reduction applied automatically to your invoices.",
  "Open to new and current students across all courses.",
  "Reviewed personally by our team, confidentially.",
];

export default function ScholarshipPortal() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [app, setApp] = useState<App | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setChecked(true); return; }
    setAuthed(true);
    const { data } = await supabase.from("scholarship_applications").select("id, status, awarded_amount, valid_until, admin_notes").eq("user_id", user.id).maybeSingle();
    setApp((data as App) ?? null);
    setChecked(true);
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4"><HeartHandshake className="w-3.5 h-3.5" /> Financial Aid</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Need-Based Scholarships</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
          Cost should never block a deserving student. Apply for a scholarship and, if approved, get a monthly fee reduction on your courses.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span className="text-foreground/80">{p}</span></li>
          ))}
        </ul>
      </div>

      {!checked ? (
        <div className="grid place-items-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : !authed ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">Sign in to apply</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-sm mx-auto">Create a free account or sign in so we can link your scholarship to your fees.</p>
          <Link href={`/login?redirectedFrom=${encodeURIComponent("/scholarships")}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
            <LogIn className="w-4 h-4" /> Sign in to apply
          </Link>
        </div>
      ) : app ? (
        <Status app={app} />
      ) : (
        <ApplyForm onDone={load} />
      )}
    </>
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

function Status({ app }: { app: App }) {
  if (app.status === "approved") {
    return <Info icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} title="Scholarship approved 🎉"
      body={`You've been granted ${app.awarded_amount ? fmt(app.awarded_amount) : "a"} monthly fee reduction${app.valid_until ? ` until ${new Date(app.valid_until).toLocaleDateString()}` : ""}. It's applied automatically to your monthly invoices.`} />;
  }
  if (app.status === "rejected") {
    return <Info icon={<XCircle className="w-5 h-5 text-destructive" />} title="Application not approved"
      body={app.admin_notes || "Unfortunately we couldn't approve your scholarship this time. You're welcome to reach out to discuss options."} />;
  }
  if (app.status === "waitlisted") {
    return <Info icon={<ListChecks className="w-5 h-5 text-amber-500" />} title="You're on the waitlist"
      body="Your application is strong but our current scholarship slots are full. We'll contact you if a slot opens." />;
  }
  return <Info icon={<Clock className="w-5 h-5 text-primary" />} title="Application under review"
    body="Thank you — we've received your scholarship application. Our team will review it and get back to you shortly." />;
}

function ApplyForm({ onDone }: { onDone: () => void }) {
  const { catalog } = useCatalog();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitScholarship(formData);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else onDone();
    });
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
      <h2 className="text-lg font-bold">Scholarship application</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={label}>Full name *</label><input name="full_name" required className={field} /></div>
        <div><label className={label}>Email *</label><input name="email" type="email" required className={field} /></div>
        <div><label className={label}>Phone / WhatsApp</label><input name="phone" type="tel" className={field} /></div>
        <div>
          <label className={label}>Course you need aid for</label>
          <select name="subject_name" defaultValue="" className={field}
            onChange={(e) => { const slug = catalog.find((c) => c.name === e.target.value)?.slug ?? ""; (e.target.form?.elements.namedItem("subject_slug") as HTMLInputElement).value = slug; }}>
            <option value="">Any / not sure</option>
            {catalog.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
          <input type="hidden" name="subject_slug" />
        </div>
        <div><label className={label}>Monthly household income (PKR)</label><input name="monthly_income" type="number" min={0} className={field} /></div>
        <div><label className={label}>Household size</label><input name="household_size" type="number" min={1} className={field} /></div>
      </div>
      <div><label className={label}>Why do you need this scholarship? *</label><textarea name="reason" rows={5} required className={field} placeholder="Tell us about your situation and why you need financial support." /></div>
      <div>
        <label className={label}>Supporting document (optional)</label>
        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
          <input type="file" name="document" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Income certificate / proof of need (JPG, PNG or PDF)</p>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={pending} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />} Submit application
      </button>
      <p className="text-[11px] text-muted-foreground text-center">Your information is kept confidential and used only to assess your application.</p>
    </form>
  );
}
