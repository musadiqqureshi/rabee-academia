"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// One-click enroll: if signed out, go straight to login and return to the
// invoice (#enroll) afterwards; if signed in, jump to the invoice form.
export default function EnrollButton({
  slug, label, className,
}: { slug: string; label: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    const target = `/quran-learning/${slug}#enroll`;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirectedFrom=${encodeURIComponent(target)}`);
      return;
    }
    setBusy(false);
    document.getElementById("enroll")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button onClick={handle} disabled={busy} className={className}>
      {label} {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
    </button>
  );
}
