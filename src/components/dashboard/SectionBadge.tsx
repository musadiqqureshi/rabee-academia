"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playPing } from "@/lib/ping";

type SB = ReturnType<typeof createClient>;

const SEEN_KEY = "rabee_chat_seen_at";
function getSeen(): string {
  try { return localStorage.getItem(SEEN_KEY) ?? new Date(0).toISOString(); } catch { return new Date(0).toISOString(); }
}
function markSeen() {
  try { localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* ignore */ }
}

// A counter per sidebar section. Returns the "needs attention" count. RLS scopes
// each query (admins see all pending items; students/teachers only their own).
const COUNTERS: Record<string, (s: SB, uid: string) => Promise<number>> = {
  "/chat": async (s, uid) => {
    const { count } = await s.from("messages").select("id", { count: "exact", head: true }).neq("sender_id", uid).gt("created_at", getSeen());
    return count ?? 0;
  },
  "/notifications": async (s, uid) => {
    const { count } = await s.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("is_read", false);
    return count ?? 0;
  },
  "/enrollments": async (s) => {
    const { count } = await s.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "pending");
    return count ?? 0;
  },
  "/demos": async (s) => {
    const { count } = await s.from("demo_requests").select("id", { count: "exact", head: true }).eq("status", "pending");
    return count ?? 0;
  },
  "/ai-pro": async (s) => {
    const { count } = await s.from("ai_pro_requests").select("id", { count: "exact", head: true }).eq("status", "pending");
    return count ?? 0;
  },
};

// Unread/pending badge for a sidebar item. Polls every 15s (and on focus) so it
// works with or without Supabase Realtime; chimes when a count rises.
export default function SectionBadge({ href }: { href: string }) {
  const counter = COUNTERS[href];
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const prevRef = useRef(0);
  const initedRef = useRef(false);

  const onChatSection = href === "/chat" && pathname.endsWith("/chat");

  useEffect(() => {
    if (onChatSection) { markSeen(); prevRef.current = 0; setCount(0); }
  }, [onChatSection]);

  useEffect(() => {
    if (!counter) return;
    const supabase = createClient();
    let interval: ReturnType<typeof setInterval> | null = null;
    let uid: string | null = null;

    async function refresh() {
      if (!uid) return;
      if (href === "/chat" && window.location.pathname.endsWith("/chat")) { prevRef.current = 0; setCount(0); return; }
      let next = 0;
      try { next = await counter(supabase, uid); } catch { next = 0; }
      if (initedRef.current && next > prevRef.current) playPing();
      prevRef.current = next;
      initedRef.current = true;
      setCount(next);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      uid = user.id;
      refresh();
      interval = setInterval(refresh, 15000);
    });
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  if (!counter || count <= 0) return null;
  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center shrink-0">
      {count > 9 ? "9+" : count}
    </span>
  );
}
