import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const redirectedFrom = searchParams.get("redirectedFrom");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Priority: redirectedFrom → next → role-based home
      if (redirectedFrom) {
        return NextResponse.redirect(`${origin}${redirectedFrom}`);
      }
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role =
        (profile?.role as UserRole | undefined) ??
        (data.user?.app_metadata?.role as UserRole | undefined) ??
        (data.user?.user_metadata?.role as UserRole | undefined);

      return NextResponse.redirect(
        `${origin}${role ? ROLE_HOME[role] : "/dashboard/student"}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
