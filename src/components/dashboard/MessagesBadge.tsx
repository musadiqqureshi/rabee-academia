"use client";

import { useEffect, useState } from "react";
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

  const onChat = pathname.endsWith("/chat");

  // Opening the chat page clears the badge and records the moment as "seen".
  useEffect(() => {
    if (onChat) {
      markSeen();
      setCount(0);
    }
  }, [onChat]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let uid: string | null = null;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      uid = user.id;

      if (!window.location.pathname.endsWith("/chat")) {
        const { count: c } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .neq("sender_id", uid)
          .gt("created_at", getSeen());
        setCount(c ?? 0);
      }

      channel = supabase
        .channel(`msg-badge:${uid}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const m = payload.new as { sender_id: string };
            if (!uid || m.sender_id === uid) return; // ignore my own messages
            if (window.location.pathname.endsWith("/chat")) return; // already reading
            setCount((n) => n + 1);
            playPing();
          },
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
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
