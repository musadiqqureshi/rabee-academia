import { Bell } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StudentNotifications() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, created_at, is_read")
    .or(`recipient_id.eq.${profile.id},and(recipient_role.eq.student,recipient_id.is.null)`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-muted-foreground mt-1">Announcements and alerts</p>

      {(!notifications || notifications.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No notifications</p>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ll be notified about class updates, fee reminders, and announcements.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl divide-y divide-border">
          {notifications.map((n) => (
            <div key={n.id} className="px-5 py-4 flex items-start gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.is_read ? "bg-muted-foreground/30" : "bg-primary"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
