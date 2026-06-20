"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageSquare, Users, Loader2, GraduationCap, Shield, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Contact { id: string; full_name: string | null; email: string | null; role: string }
interface Group { batchId: string; label: string }
interface Message { id: string; conversation_id: string; sender_id: string; body: string; created_at: string }

const roleIcon: Record<string, React.ReactNode> = {
  super_admin: <Shield className="w-3.5 h-3.5" />,
  admin: <Shield className="w-3.5 h-3.5" />,
  teacher: <GraduationCap className="w-3.5 h-3.5" />,
  student: <UserRound className="w-3.5 h-3.5" />,
};

export default function ChatClient({
  meId, contacts, groups,
}: {
  meId: string;
  contacts: Contact[];
  groups: Group[];
}) {
  const supabase = createClient();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const nameOf = useCallback(
    (id: string) => (id === meId ? "You" : contacts.find((c) => c.id === id)?.full_name ?? "Member"),
    [contacts, meId],
  );

  const scrollDown = () =>
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 40);

  const openConversation = useCallback(async (cid: string) => {
    setConversationId(cid);
    const { data } = await supabase
      .from("messages").select("*").eq("conversation_id", cid).order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
    scrollDown();

    // (Re)subscribe to realtime inserts for this conversation.
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase
      .channel(`messages:${cid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${cid}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          scrollDown();
        })
      .subscribe();
    channelRef.current = ch;
  }, [supabase]);

  useEffect(() => () => { if (channelRef.current) supabase.removeChannel(channelRef.current); }, [supabase]);

  async function selectContact(c: Contact) {
    setActiveKey(`u:${c.id}`); setActiveTitle(c.full_name ?? "Direct message"); setLoading(true);
    const { data, error } = await supabase.rpc("get_or_create_direct", { other: c.id });
    setLoading(false);
    if (!error && data) await openConversation(data as string);
  }
  async function selectGroup(g: Group) {
    setActiveKey(`g:${g.batchId}`); setActiveTitle(`${g.label} (class group)`); setLoading(true);
    const { data, error } = await supabase.rpc("get_or_create_batch_group", { batch: g.batchId });
    setLoading(false);
    if (!error && data) await openConversation(data as string);
  }

  async function send() {
    const body = text.trim();
    if (!body || !conversationId) return;
    setText("");
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: meId, body });
    scrollDown();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] h-[calc(100vh-12rem)] min-h-[440px] rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="border-r border-border overflow-y-auto">
        {groups.length > 0 && (
          <div className="p-2">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Class Groups</p>
            {groups.map((g) => (
              <button key={g.batchId} onClick={() => selectGroup(g)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors ${activeKey === `g:${g.batchId}` ? "bg-muted" : ""}`}>
                <span className="w-7 h-7 rounded-lg bg-accent/15 text-accent grid place-items-center shrink-0"><Users className="w-3.5 h-3.5" /></span>
                <span className="truncate">{g.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="p-2">
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Contacts</p>
          {contacts.length === 0 && <p className="px-2 text-xs text-muted-foreground">No contacts yet.</p>}
          {contacts.map((c) => (
            <button key={c.id} onClick={() => selectContact(c)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors ${activeKey === `u:${c.id}` ? "bg-muted" : ""}`}>
              <span className="w-7 h-7 rounded-full bg-primary/15 text-primary grid place-items-center shrink-0">{roleIcon[c.role] ?? <UserRound className="w-3.5 h-3.5" />}</span>
              <span className="min-w-0">
                <span className="block truncate">{c.full_name ?? c.email}</span>
                <span className="block text-[10px] text-muted-foreground capitalize">{c.role.replace("_", " ")}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex flex-col min-w-0">
        {!conversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
            <MessageSquare className="w-10 h-10" />
            <p className="text-sm">Select a contact or class group to start chatting.</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border font-semibold text-sm">{activeTitle}</div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && <div className="text-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline" /></div>}
              {messages.map((m) => {
                const mine = m.sender_id === meId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {!mine && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{nameOf(m.sender_id)}</p>}
                      <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                      <p className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {!loading && messages.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet — say hello 👋</p>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border p-3 flex items-center gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
              <button type="submit" disabled={!text.trim()} className="grid place-items-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
