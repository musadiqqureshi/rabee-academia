import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStudents() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {students?.length ?? 0} registered student{students?.length !== 1 ? "s" : ""}
      </p>

      {(!students || students.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No students registered</p>
          <p className="text-sm text-muted-foreground mt-1">Students who sign up will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(s.created_at).toLocaleDateString()}
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
