import { Users } from "lucide-react";
import { requireRole, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";
import UserRowActions from "./UserRowActions";

const roleStyle: Record<string, string> = {
  super_admin: "bg-purple-500/15 text-purple-400",
  admin: "bg-blue-500/15 text-blue-400",
  teacher: "bg-primary/15 text-primary",
  student: "bg-green-500/15 text-green-400",
};

export default async function SuperAdminUsers() {
  await requireRole("admin");
  const me = await getProfile();
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">All Users</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {users?.length ?? 0} total user{users?.length !== 1 ? "s" : ""} on the platform
      </p>

      {(!users || users.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No users found</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleStyle[u.role as UserRole] ?? "bg-muted text-muted-foreground"}`}>
                      {u.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <UserRowActions id={u.id} role={u.role} isSelf={u.id === me?.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
