import { Mail, Phone, BadgeCheck, CalendarDays } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

const ROLE_LABEL: Record<string, string> = {
  student: "Student", teacher: "Teacher", admin: "Administrator", super_admin: "Administrator",
};

// Shared profile header — name, role, and the user's own details. Used on every
// dashboard's /profile page.
export default function ProfileCard({ profile }: { profile: Profile }) {
  const name = profile.full_name ?? profile.email ?? "User";
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const rows: { icon: React.ReactNode; label: string; value: string | null | undefined }[] = [
    { icon: <Mail className="w-4 h-4" />, label: "Email", value: profile.email },
    { icon: <Phone className="w-4 h-4" />, label: "Phone", value: profile.phone },
    { icon: <BadgeCheck className="w-4 h-4" />, label: profile.role === "student" ? "Student ID" : "User ID", value: profile.student_code ?? profile.id.slice(0, 8) },
    { icon: <CalendarDays className="w-4 h-4" />, label: "Member since", value: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : null },
  ];

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white grid place-items-center text-2xl font-extrabold shrink-0">
          {initial}
        </div>
        <div>
          <h1 className="text-xl font-bold">{name}</h1>
          <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {ROLE_LABEL[profile.role] ?? profile.role}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-6">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground shrink-0">{r.icon}</span>
            <span className="text-muted-foreground w-24 shrink-0">{r.label}</span>
            <span className="font-medium break-all">{r.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
