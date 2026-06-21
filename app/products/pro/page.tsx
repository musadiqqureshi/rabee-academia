"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Loader2, Building2, Upload, Copy, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import EnforceTheme from "@/components/EnforceTheme";
import AnimatedBackground from "@/components/AnimatedBackground";
import { createClient } from "@/lib/supabase/client";
import { submitProRequest } from "./actions";

const BANK = {
  bankName: "Meezan Bank",
  accountTitle: "MUHAMMAD MUSSADDIQ AHMED QURESHI",
  accountId: "68020114723362",
  iban: "PK87MEZN0068020114723362",
  branch: "JHANG RD MUZAFFARGARH BR",
};
const PRICE = 3000;

type Status = "loading" | "active" | "pending" | "buy";

export default function ProPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [proUntil, setProUntil] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace(`/login?redirectedFrom=${encodeURIComponent("/products/pro")}`); return; }

    const { data: usage } = await supabase
      .from("ai_paper_usage").select("pro_until").eq("user_id", user.id).maybeSingle();
    if (usage?.pro_until && new Date(usage.pro_until) > new Date()) {
      setProUntil(usage.pro_until); setStatus("active"); return;
    }
    const { data: req } = await supabase
      .from("ai_pro_requests").select("status").eq("user_id", user.id).eq("status", "pending").maybeSingle();
    setStatus(req ? "pending" : "buy");
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) { setError("Please upload your payment screenshot."); return; }
    setError(null); setLoading(true);
    const fd = new FormData();
    fd.set("months", "1");
    fd.set("receipt", receipt);
    const res = await submitProRequest(fd);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
    setStatus("pending");
  }

  function copyIban() {
    navigator.clipboard?.writeText(BANK.iban);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <EnforceTheme mode="site" />
      <AnimatedBackground />
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-xl">
        <Link href="/products/paper-maker" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to Paper Maker</Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white grid place-items-center mx-auto mb-3"><Crown className="w-7 h-7" /></div>
          <h1 className="text-3xl font-extrabold">Rabee&apos;s AI Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">Unlimited exam papers, answer keys &amp; PDF downloads.</p>
        </div>

        {status === "loading" && <div className="grid place-items-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

        {status === "active" && (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-lg">You&apos;re a Pro member 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">Active until <strong>{new Date(proUntil!).toLocaleDateString()}</strong>. Enjoy unlimited papers.</p>
            <Link href="/products/paper-maker" className="inline-flex mt-5 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90">Open Paper Maker</Link>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <Clock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="font-bold text-lg">Verification in progress</p>
            <p className="text-sm text-muted-foreground mt-1">We&apos;ve received your Pro request. Our admin team will verify your payment and activate Pro shortly.</p>
          </div>
        )}

        {status === "buy" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="rounded-xl border border-border p-4 mb-5 text-center">
              <p className="text-3xl font-extrabold">PKR {PRICE.toLocaleString("en-PK")}<span className="text-sm font-medium text-muted-foreground">/month</span></p>
              <p className="text-xs text-muted-foreground mt-1">Unlimited papers · priority generation</p>
            </div>

            <h3 className="font-bold mb-2 text-sm">Transfer to (Meezan Bank)</h3>
            <div className="bg-muted/40 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
              {[["Bank", BANK.bankName], ["Account Title", BANK.accountTitle], ["Account No.", BANK.accountId], ["Branch", BANK.branch]].map(([l, v]) => (
                <div key={l} className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                  <span className="text-muted-foreground text-xs">{l}</span>
                  <span className="font-semibold text-xs break-all">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                <span className="text-muted-foreground text-xs">IBAN</span>
                <span className="font-mono font-semibold text-xs break-all flex items-center gap-2">
                  {BANK.iban}
                  <button type="button" onClick={copyIban} className="text-primary hover:opacity-80" aria-label="Copy IBAN"><Copy className="w-3.5 h-3.5" /></button>
                </span>
              </div>
              {copied && <p className="text-[11px] text-primary text-right">IBAN copied</p>}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Upload Payment Screenshot</label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  {receipt ? <p className="text-sm text-primary font-medium">{receipt.name}</p> : <p className="text-sm text-muted-foreground">Click to upload screenshot (JPG, PNG, PDF)</p>}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Submit for Admin Verification
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
