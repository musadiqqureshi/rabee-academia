import { Bell } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SendNotificationForm from "./SendNotificationForm";

export default async function SuperAdminNotifications() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, recipient_role, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-muted-foreground mt-1">Send announcements and view notification history</p>

      <div className="mt-6">
        <SendNotificationForm />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Sent Notifications</h2>
        {(!notifications || notifications.length === 0) ? (
          <div className="bg-card border border-card-border rounded-xl p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No notifications sent yet</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                </div>
                <div className="text-right shrink-0">
                  {n.recipient_role && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary capitalize">
                      {n.recipient_role.replace("_", " ")}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
