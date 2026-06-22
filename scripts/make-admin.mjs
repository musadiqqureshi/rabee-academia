// Promote a user to admin by email, using the Supabase service role.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/make-admin.mjs muzzammilkhan7890@gmail.com
//
// The email defaults to muzzammilkhan7890@gmail.com if none is passed.
// Updates both the auth user metadata and the profiles.role column so the
// app's role checks (which read profiles.role) take effect immediately.

import { createClient } from "@supabase/supabase-js";

const email = (process.argv[2] ?? "muzzammilkhan7890@gmail.com").trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Find the auth user by email (page through users; lists are paginated).
async function findUserByEmail(target) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 200) break; // last page
  }
  return null;
}

const user = await findUserByEmail(email);
if (!user) {
  console.error(`No user found with email ${email}. They must sign up first.`);
  process.exit(1);
}

// 1. Update auth metadata.
const { error: authErr } = await admin.auth.admin.updateUserById(user.id, {
  user_metadata: { ...user.user_metadata, role: "admin" },
  app_metadata: { ...user.app_metadata, role: "admin" },
});
if (authErr) {
  console.error("Failed to update auth metadata:", authErr.message);
  process.exit(1);
}

// 2. Update profiles.role (this is what the app's authorization checks read).
const { error: profErr } = await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
if (profErr) {
  console.error("Failed to update profiles.role:", profErr.message);
  process.exit(1);
}

console.log(`✅ ${email} (${user.id}) is now an admin.`);
