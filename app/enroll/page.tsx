"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, CheckCircle2, CreditCard,
  Building2, Upload, Loader2, Atom, Clock, CalendarDays,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getCourse, formatPrice } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IBAN_DETAILS = {
  bankName: "Meezan Bank",
  accountTitle: "Rabee Academia",
  iban: "PK00MEZN0001234567890123",
  currency: "PKR",
};

type Step = "confirm" | "details" | "payment" | "success";
type PayMethod = "assanpay" | "iban" | null;

function EnrollContent() {
  const params = useSearchParams();
  const slug = params.get("subject") ?? "";
  const type = (params.get("type") ?? "regular") as "regular" | "weekend";

  const course = getCourse(slug);

  const [step, setStep] = useState<Step>("confirm");
  const [payMethod, setPayMethod] = useState<PayMethod>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-semibold mb-2">Course not found.</p>
          <Link href="/pricing" className="text-primary underline text-sm">Browse all courses</Link>
        </div>
      </div>
    );
  }

  const price = type === "regular" ? course.regularPrice : course.weekendPrice;
  const Icon = course.icon;

  const steps: Step[] = ["confirm", "details", "payment", "success"];
  const stepLabel: Record<Step, string> = {
    confirm: "Review",
    details: "Your Details",
    payment: "Payment",
    success: "Confirmed",
  };

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  async function handleAssanPay() {
    setLoading(true);
    // AssanPay redirect — replace with real gateway URL + merchant params when live.
    await new Promise((r) => setTimeout(r, 800));
    alert("AssanPay integration coming soon. Your enrollment has been registered.");
    setLoading(false);
    setStep("success");
  }

  async function handleIBANSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) { setError("Please upload your payment receipt."); return; }
    setError(null);
    setLoading(true);
    // TODO: upload receipt to Supabase Storage and create enrollment record.
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("success");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-2xl">

        {/* Progress bar */}
        {step !== "success" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              {steps.filter((s) => s !== "success").map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    steps.indexOf(step) >= steps.indexOf(s)
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {steps.indexOf(step) > steps.indexOf(s)
                      ? <CheckCircle2 className="w-4 h-4" />
                      : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    step === s ? "text-foreground" : "text-muted-foreground"
                  }`}>{stepLabel[s]}</span>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${
                      steps.indexOf(step) > i ? "bg-primary" : "bg-border"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 1: Confirm ── */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 className="text-2xl font-extrabold mb-6">Review Your Enrollment</h1>

              <div className={`rounded-2xl bg-gradient-to-br ${course.gradient} p-6 mb-6 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/8" />
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
                    {type === "regular"
                      ? <><Clock className="w-4 h-4" /> Regular Classes (Mon–Fri)</>
                      : <><CalendarDays className="w-4 h-4" /> Weekend Classes (Sat–Sun)</>}
                  </div>
                  <Link href="/pricing" className="text-xs text-primary hover:underline">Change</Link>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Fee</span>
                  <span className="text-2xl font-extrabold">{formatPrice(price)}</span>
                </div>

                <ul className="space-y-2">
                  {course.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-foreground/75">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={() => setStep("details")} className="w-full py-3 text-sm font-bold">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Details ── */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <button onClick={() => setStep("confirm")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-extrabold mb-6">Your Details</h1>

              <form onSubmit={handleSubmitDetails} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ali Ahmed" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone / WhatsApp</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" required />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total due</span>
                  <span className="font-extrabold">{formatPrice(price)}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                </div>

                <Button type="submit" className="w-full font-bold">
                  Proceed to Payment <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <button onClick={() => setStep("details")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-extrabold mb-2">Choose Payment Method</h1>
              <p className="text-muted-foreground text-sm mb-6">Amount due: <strong className="text-foreground">{formatPrice(price)}/month</strong></p>

              {/* Method selector */}
              {!payMethod && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPayMethod("assanpay")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary bg-card transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Online Payment</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Pay securely via AssanPay</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPayMethod("iban")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-accent bg-card transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground mt-0.5">IBAN / international wire</p>
                    </div>
                  </button>
                </div>
              )}

              {/* AssanPay */}
              {payMethod === "assanpay" && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <button onClick={() => setPayMethod(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Other method
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">AssanPay Secure Checkout</p>
                      <p className="text-xs text-muted-foreground">You will be redirected to complete payment</p>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Course</span><span className="font-medium">{course.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Class type</span><span className="font-medium capitalize">{type}</span></div>
                    <div className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>Total</span><span>{formatPrice(price)}/mo</span></div>
                  </div>
                  <Button onClick={handleAssanPay} disabled={loading} className="w-full font-bold">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Pay {formatPrice(price)} via AssanPay
                  </Button>
                </div>
              )}

              {/* IBAN */}
              {payMethod === "iban" && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <button onClick={() => setPayMethod(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Other method
                  </button>
                  <h3 className="font-bold mb-3">Bank Transfer Details</h3>
                  <div className="bg-muted/40 rounded-xl p-4 mb-5 space-y-2.5 text-sm font-mono">
                    {[
                      ["Bank", IBAN_DETAILS.bankName],
                      ["Account Title", IBAN_DETAILS.accountTitle],
                      ["IBAN", IBAN_DETAILS.iban],
                      ["Currency", IBAN_DETAILS.currency],
                      ["Amount", formatPrice(price)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                        <span className="text-muted-foreground text-xs font-sans">{label}</span>
                        <span className="font-semibold text-xs break-all">{value}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleIBANSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="receipt">Upload Payment Receipt</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                        <input
                          id="receipt"
                          type="file"
                          accept="image/*,application/pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                        />
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        {receipt
                          ? <p className="text-sm text-primary font-medium">{receipt.name}</p>
                          : <><p className="text-sm text-muted-foreground">Click to upload receipt</p>
                             <p className="text-xs text-muted-foreground/60 mt-0.5">JPG, PNG or PDF</p></>}
                      </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full font-bold">
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit for Admin Verification
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 4: Success ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">Enrollment Submitted!</h1>
              <p className="text-muted-foreground text-sm mb-2">
                Thank you, <strong>{fullName || "Student"}</strong>. Your enrollment for <strong>{course.name}</strong> has been received.
              </p>
              <p className="text-muted-foreground text-sm mb-8">
                Our admin team will verify your payment and assign you a teacher. You will receive your Google Meet class link via email at <strong>{email}</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/student" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  Enroll in Another Subject
                </Link>
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
