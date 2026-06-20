import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";

// Creates a teacher account. Only super_admins may call this. Uses the service
// role key to create the auth user (not possible with the anon client).
export async function POST(req: Request) {
  const caller = await getProfile();
  if (!caller || !["admin", "super_admin"].includes(caller.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let body: { full_name?: string; email?: string; phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const fullName = (body.full_name ?? "").trim();
  const password = body.password ?? "";
  if (!email || !fullName || password.length < 6) {
    return NextResponse.json(
      { error: "Name, email and a password (min 6 chars) are required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone: body.phone ?? null, role: "teacher" },
  });
  if (authError || !created.user) {
    return NextResponse.json({ error: authError?.message ?? "Could not create user" }, { status: 400 });
  }

  // Ensure the profile row exists with role=teacher (the signup trigger may
  // default to student depending on metadata timing).
  await admin.from("profiles").upsert(
    {
      id: created.user.id,
      full_name: fullName,
      email,
      phone: body.phone ?? null,
      role: "teacher",
    },
    { onConflict: "id" },
  );

  return NextResponse.json({ ok: true });
}
