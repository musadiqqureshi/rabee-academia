"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, CheckCircle2, CreditCard,
  Building2, Upload, Loader2, Clock, CalendarDays, Star, Copy,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EnforceTheme from "@/components/EnforceTheme";
import { getCourse, formatPrice } from "@/lib/courses";
import { createClient } from "@/lib/supabase/client";
import { submitEnrollment } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Meezan Bank — Rabee Academia
const BANK = {
  bankName: "Meezan Bank",
  accountTitle: "MUHAMMAD MUSSADDIQ AHMED QURESHI",
  accountId: "68020114723362",
  iban: "PK87MEZN0068020114723362",
  branch: "JHANG RD MUZAFFARGARH BR",
};

type Step = "confirm" | "details" | "payment" | "success";
type PayMethod = "assanpay" | "iban" | null;

function EnrollContent() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get("subject") ?? "";
  const type = (params.get("type") ?? "regular") as "regular" | "weekend";
  const course = getCourse(slug);

  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState<Step>("confirm");
  const [payMethod, setPayMethod] = useState<PayMethod>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Require login. If signed out, send to login and return here afterwards.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        const back = `/enroll?subject=${encodeURIComponent(slug)}&type=${type}`;
        router.replace(`/login?redirectedFrom=${encodeURIComponent(back)}`);
        return;
      }
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      setAuthChecked(true);
    });
  }, [slug, type, router]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <EnforceTheme mode="site" />
        <div>
          <p className="text-lg font-semibold mb-2">Course not found.</p>
          <Link href="/pricing" className="text-primary underline text-sm">Browse all courses</Link>
        </div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EnforceTheme mode="site" />
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const price = type === "regular" ? course.regularPrice : course.weekendPrice;
  const Icon = course.icon;
  const steps: Step[] = ["confirm", "details", "payment", "success"];
  const stepLabel: Record<Step, string> = { confirm: "Review", details: "Your Details", payment: "Payment", success: "Confirmed" };

  function buildFormData(method: "assanpay" | "iban") {
    const fd = new FormData();
    fd.set("slug", course!.slug);
    fd.set("course_name", course!.name);
    fd.set("level", course!.level);
    fd.set("lessons", String(course!.lessons));
    fd.set("regular_price", String(course!.regularPrice));
    fd.set("weekend_price", String(course!.weekendPrice));
    fd.set("type", type);
    fd.set("amount", String(price));
    fd.set("full_name", fullName);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("pay_method", method);
    if (method === "iban" && receipt) fd.set("receipt", receipt);
    return fd;
  }

  async function handleAssanPay() {
    setLoading(true);
    setError(null);
    // AssanPay would redirect to the gateway here; we register the (pending)
    // enrolment first so it shows up for the student and admin.
    const res = await submitEnrollment(buildFormData("assanpay"));
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
    setStep("success");
  }

  async function handleBankSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) { setError("Please upload your payment screenshot."); return; }
    setError(null);
    setLoading(true);
    const res = await submitEnrollment(buildFormData("iban"));
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
    setStep("success");
  }

  function copyIban() {
    navigator.clipboard?.writeText(BANK.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-2xl">
        {step !== "success" && (
          <div className="mb-8 flex items-center gap-2">
            {steps.filter((s) => s !== "success").map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  steps.indexOf(step) >= steps.indexOf(s) ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {steps.indexOf(step) > steps.indexOf(s) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${step === s ? "text-foreground" : "text-muted-foreground"}`}>{stepLabel[s]}</span>
                {i < arr.length - 1 && <div className={`flex-1 h-px mx-1 ${steps.indexOf(step) > i ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Confirm */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 className="text-2xl font-extrabold mb-6">Review Your Enrollment</h1>
              <div className={`rounded-2xl bg-gradient-to-br ${course.gradient} p-6 mb-6 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium mb-0.5">{course.level}</p>
                    <p className="text-white font-bold text-lg leading-tight">{course.name}</p>
                    <p className="text-white/80 text-xs mt-0.5">{course.lessons} lessons · Live + recorded</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {type === "regular" ? <><Clock className="w-4 h-4" /> Regular Classes (Mon–Fri)</> : <><CalendarDays className="w-4 h-4" /> Weekend Classes (Sat–Sun)</>}
                  </div>
                  <Link href="/pricing" className="text-xs text-primary hover:underline">Change</Link>
                </div>
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Fee</span>
                  <span className="text-2xl font-extrabold">{formatPrice(price)}</span>
                </div>
              </div>
              <Button onClick={() => setStep("details")} className="w-full py-3 text-sm font-bold">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <button onClick={() => setStep("confirm")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
              <h1 className="text-2xl font-extrabold mb-6">Your Details</h1>
              <form onSubmit={(e) => { e.preventDefault(); setStep("payment"); }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ali Ahmed" required /></div>
                <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label htmlFor="phone">Phone / WhatsApp</Label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" required /></div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total due</span>
                  <span className="font-extrabold">{formatPrice(price)}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                </div>
                <Button type="submit" className="w-full font-bold">Proceed to Payment <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <button onClick={() => { setPayMethod(null); setStep("details"); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
              <h1 className="text-2xl font-extrabold mb-2">Choose Payment Method</h1>
              <p className="text-muted-foreground text-sm mb-6">Amount due: <strong className="text-foreground">{formatPrice(price)}/month</strong></p>

              {!payMethod && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={() => setPayMethod("iban")} className="relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-primary bg-primary/5 transition-all group">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold"><Star className="w-3 h-3 fill-current" /> RECOMMENDED</span>
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary"><Building2 className="w-6 h-6" /></div>
                    <div className="text-center"><p className="font-bold text-sm">Bank Transfer</p><p className="text-xs text-muted-foreground mt-0.5">Meezan Bank · upload screenshot</p></div>
                  </button>
                  <button onClick={() => setPayMethod("assanpay")} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-accent bg-card transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent"><CreditCard className="w-6 h-6" /></div>
                    <div className="text-center"><p className="font-bold text-sm">Online Payment</p><p className="text-xs text-muted-foreground mt-0.5">Pay via AssanPay</p></div>
                  </button>
                </div>
              )}

              {/* AssanPay */}
              {payMethod === "assanpay" && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <button onClick={() => setPayMethod(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-3.5 h-3.5" /> Other method</button>
                  <div className="bg-muted/40 rounded-xl p-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Course</span><span className="font-medium">{course.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Class type</span><span className="font-medium capitalize">{type}</span></div>
                    <div className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>Total</span><span>{formatPrice(price)}/mo</span></div>
                  </div>
                  {error && <p className="text-sm text-destructive mb-3">{error}</p>}
                  <Button onClick={handleAssanPay} disabled={loading} className="w-full font-bold">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Continue to AssanPay
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center mt-2">You will be redirected to AssanPay&apos;s secure portal.</p>
                </div>
              )}

              {/* Bank transfer — invoice + details + receipt upload */}
              {payMethod === "iban" && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <button onClick={() => setPayMethod(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-3.5 h-3.5" /> Other method</button>

                  {/* Invoice summary */}
                  <div className="rounded-xl border border-border overflow-hidden mb-5">
                    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
                      <span className="font-bold text-sm">Payment Invoice</span>
                      <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{fullName || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Course</span><span className="font-medium">{course.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Class type</span><span className="font-medium capitalize">{type}</span></div>
                      <div className="flex justify-between border-t border-border pt-2 mt-1 font-bold text-base"><span>Amount Due</span><span>{formatPrice(price)}</span></div>
                    </div>
                  </div>

                  {/* Meezan account details */}
                  <h3 className="font-bold mb-2 text-sm">Transfer to (Meezan Bank)</h3>
                  <div className="bg-muted/40 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
                    {[
                      ["Bank", BANK.bankName],
                      ["Account Title", BANK.accountTitle],
                      ["Account No.", BANK.accountId],
                      ["Branch", BANK.branch],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <span className="font-semibold text-xs break-all">{value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                      <span className="text-muted-foreground text-xs">IBAN</span>
                      <span className="font-mono font-semibold text-xs break-all flex items-center gap-2">
                        {BANK.iban}
                        <button type="button" onClick={copyIban} className="text-primary hover:opacity-80" aria-label="Copy IBAN">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </div>
                    {copied && <p className="text-[11px] text-primary text-right">IBAN copied</p>}
                  </div>

                  <form onSubmit={handleBankSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="receipt">Upload Payment Screenshot</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                        <input id="receipt" type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        {receipt ? <p className="text-sm text-primary font-medium">{receipt.name}</p> : <><p className="text-sm text-muted-foreground">Click to upload screenshot</p><p className="text-xs text-muted-foreground/60 mt-0.5">JPG, PNG or PDF</p></>}
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" disabled={loading} className="w-full font-bold">
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Submit for Admin Verification
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary mx-auto mb-6"><CheckCircle2 className="w-10 h-10" /></div>
              <h1 className="text-2xl font-extrabold mb-2">Enrollment Submitted!</h1>
              <p className="text-muted-foreground text-sm mb-2">Thank you, <strong>{fullName || "Student"}</strong>. Your enrollment for <strong>{course.name}</strong> has been received.</p>
              <p className="text-muted-foreground text-sm mb-8">Our admin team will verify your payment and assign you a teacher. You can track the status in your dashboard.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/student/subjects" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90"><span>Go to My Courses</span> <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Enroll in Another Subject</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={null}>
      <EnrollContent />
    </Suspense>
  );
}
