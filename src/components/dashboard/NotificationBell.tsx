"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { playPing } from "@/lib/ping";

interface Note { id: string; title: string; body: string | null; is_read: boolean; created_at: string }

export default function NotificationBell() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const lastTopRef = useRef<string | null>(null);
  const initedRef = useRef(false);

  const unread = notes.filter((n) => !n.is_read).length;

  async function load(userId: string) {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    const list = (data as Note[]) ?? [];
    const newestId = list[0]?.id ?? null;
    // A brand-new notification arrived (top row changed after first load).
    if (initedRef.current && newestId && newestId !== lastTopRef.current) {
      playPing();
      router.refresh();
    }
    lastTopRef.current = newestId;
    initedRef.current = true;
    setNotes(list);
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      userId = user.id;
      setUid(user.id);
      load(user.id);
      // Poll every 15s so it works even without Supabase Realtime enabled.
      interval = setInterval(() => load(user.id), 15000);
      // Realtime (instant) when available — also routed through load().
      channel = supabase
        .channel(`notes:${user.id}`)
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => load(user.id))
        .subscribe();
    });
    // Refresh immediately when the tab regains focus.
    const onFocus = () => { if (userId) load(userId); };
    window.addEventListener("focus", onFocus);
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAllRead() {
    if (!uid) return;
    setNotes((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", uid).eq("is_read", false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-border/60 last:border-0 ${n.is_read ? "" : "bg-primary/5"}`}>
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
