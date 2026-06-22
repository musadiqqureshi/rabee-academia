"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playPing } from "@/lib/ping";

// Unread-message counter shown beside the "Messages" sidebar item. There is no
// per-message read flag in the schema, so we track "last seen" locally: every
// message from someone else created after the last time this user opened the
// chat page counts as unread. RLS already scopes `messages` to the user's own
// conversations, so the count query needs no extra filtering.
const SEEN_KEY = "rabee_chat_seen_at";

function getSeen(): string {
  if (typeof window === "undefined") return new Date(0).toISOString();
  try {
    return localStorage.getItem(SEEN_KEY) ?? new Date(0).toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, new Date().toISOString());
  } catch {
    // ignore (private mode / storage disabled)
  }
}

export default function MessagesBadge() {
  const supabase = createClient();
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const prevRef = useRef(0);
  const initedRef = useRef(false);

  const onChat = pathname.endsWith("/chat");

  // Opening the chat page clears the badge and records the moment as "seen".
  useEffect(() => {
    if (onChat) {
      markSeen();
      prevRef.current = 0;
      setCount(0);
    }
  }, [onChat]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let uid: string | null = null;

    async function refresh() {
      if (!uid) return;
      if (window.location.pathname.endsWith("/chat")) { prevRef.current = 0; setCount(0); return; }
      const { count: c } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", uid)
        .gt("created_at", getSeen());
      const next = c ?? 0;
      // Chime when the unread count rises (skip the very first load).
      if (initedRef.current && next > prevRef.current) playPing();
      prevRef.current = next;
      initedRef.current = true;
      setCount(next);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      uid = user.id;
      refresh();
      // Poll every 15s so it works even without Supabase Realtime enabled.
      interval = setInterval(refresh, 15000);
      channel = supabase
        .channel(`msg-badge:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => refresh(),
        )
        .subscribe();
    });

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center shrink-0">
      {count > 9 ? "9+" : count}
    </span>
  );
}
