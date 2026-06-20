import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, type Profile, type UserRole } from "@/lib/supabase/types";

// Returns the current user's profile, or null if not signed in.
export async function getProfile(): Promise<Profile | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) return profile as Profile;

  // Fall back to auth metadata if the profile row isn't ready yet.
  return {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    email: user.email ?? null,
    phone: (user.user_metadata?.phone as string) ?? null,
    role:
      ((user.app_metadata?.role ?? user.user_metadata?.role) as UserRole) ??
      "student",
    created_at: user.created_at,
  };
}

// Guards a dashboard route: redirects to /login if unauthenticated, or to the
// user's own dashboard if their role doesn't match the required one.
export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  // 'super_admin' is treated as 'admin' (deprecated role merged into admin).
  const effective: UserRole = profile.role === "super_admin" ? "admin" : profile.role;
  if (effective !== role) redirect(ROLE_HOME[effective]);
  return profile;
}
