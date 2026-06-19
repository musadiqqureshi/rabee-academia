"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function SendNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipientRole, setRecipientRole] = useState("student");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, recipient_role: recipientRole }),
      });
      if (res.ok) {
        setStatus("sent");
        setTitle("");
        setBody("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-card border border-card-border rounded-xl p-6">
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Send className="w-4 h-4 text-primary" /> Send Notification
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
            placeholder="Notification title..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-none"
            placeholder="Notification message..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
            Recipient Role
          </label>
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
          >
            <option value="student">All Students</option>
            <option value="teacher">All Teachers</option>
            <option value="admin">All Admins</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            {status === "sending" ? "Sending..." : "Send Notification"}
          </button>
          {status === "sent" && <span className="text-xs text-green-400">Notification sent!</span>}
          {status === "error" && <span className="text-xs text-red-400">Failed to send. Check API route.</span>}
        </div>
      </form>
    </div>
  );
}
