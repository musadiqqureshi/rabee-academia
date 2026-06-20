import { UserCog } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AddTeacherForm from "./AddTeacherForm";

export const dynamic = "force-dynamic";

export default async function SuperAdminTeachers() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  const teacherIds = teachers?.map((t) => t.id) ?? [];

  const { data: batches } = await supabase
    .from("batches")
    .select("teacher_id")
    .in("teacher_id", teacherIds.length > 0 ? teacherIds : ["00000000-0000-0000-0000-000000000000"]);

  const batchCountByTeacher = new Map<string, number>();
  for (const b of batches ?? []) {
    if (b.teacher_id) {
      batchCountByTeacher.set(b.teacher_id, (batchCountByTeacher.get(b.teacher_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {teachers?.length ?? 0} teacher{teachers?.length !== 1 ? "s" : ""} on the platform
          </p>
        </div>
        <AddTeacherForm />
      </div>

      {(!teachers || teachers.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <UserCog className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No teachers yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create teacher accounts to assign batches.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Batches</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.phone ?? "—"}</td>
                  <td className="px-4 py-3">{batchCountByTeacher.get(t.id) ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(t.created_at).toLocaleDateString()}
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
