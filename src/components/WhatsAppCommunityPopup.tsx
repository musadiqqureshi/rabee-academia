"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

const KEY = "rabee_wa_community_dismissed";
const LINK = "https://whatsapp.com/channel/0029VbCwJ0L1HspxfpwniD3V";

// One-time invite for signed-in students to join the WhatsApp community.
// Self-gates: only shows to a signed-in student, and only until dismissed/joined.
export default function WhatsAppCommunityPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(KEY) === "1") return; } catch { /* ignore */ }
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (((p?.role as string) ?? "student") !== "student") return;
      timer = setTimeout(() => setShow(true), 1200);
    });
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  function close() {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={close}>
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white grid place-items-center mx-auto mb-4"><FaWhatsapp className="w-8 h-8" /></div>
        <h3 className="text-xl font-extrabold mb-1">Join our WhatsApp Community</h3>
        <p className="text-sm text-muted-foreground mb-5">Stay updated about your classes, schedules, payments and portal news — straight to WhatsApp.</p>
        <a href={LINK} target="_blank" rel="noopener noreferrer" onClick={close}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:opacity-90">
          <FaWhatsapp className="w-4 h-4" /> Join the Community
        </a>
        <button onClick={close} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Maybe later</button>
      </div>
    </div>
  );
}
