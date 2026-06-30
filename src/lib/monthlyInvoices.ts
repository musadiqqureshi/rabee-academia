import type { SupabaseClient } from "@supabase/supabase-js";

// Generates monthly_fee invoices (due the 5th) for every approved enrollment
// that doesn't already have one this month, applying any per-student discount.
// Idempotent within a month. Must be called with a SERVICE-ROLE client.
export async function generateMonthlyInvoices(admin: SupabaseClient): Promise<{ created: number }> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 5).toISOString().slice(0, 10);
  const monthLabel = now.toISOString().slice(0, 7);

  const { data: enrollments } = await admin
    .from("enrollments").select("student_id, subject_id, class_type").eq("status", "approved");
  if (!enrollments?.length) return { created: 0 };

  const subjectIds = [...new Set(enrollments.map((e) => e.subject_id).filter(Boolean))] as string[];
  const { data: subjects } = subjectIds.length
    ? await admin.from("subjects").select("id, name, regular_price, weekend_price").in("id", subjectIds)
    : { data: [] as { id: string; name: string; regular_price: number; weekend_price: number }[] };
  const subjMap = new Map((subjects ?? []).map((s) => [s.id as string, s]));

  const { data: discounts } = await admin
    .from("student_fee_discounts").select("student_id, subject_id, discount_pct");
  const discMap = new Map<string, number>();
  for (const d of discounts ?? []) discMap.set(`${d.student_id}:${d.subject_id ?? "all"}`, d.discount_pct as number);

  const { data: existing } = await admin
    .from("invoices").select("student_id, subject_id")
    .eq("category", "monthly_fee").gte("issued_at", monthStart.toISOString());
  const existingSet = new Set((existing ?? []).map((i) => `${i.student_id}:${i.subject_id}`));

  const toInsert: Record<string, unknown>[] = [];
  for (const e of enrollments) {
    if (!e.subject_id) continue;
    if (existingSet.has(`${e.student_id}:${e.subject_id}`)) continue;
    const s = subjMap.get(e.subject_id as string);
    if (!s) continue;
    const baseAmount = e.class_type === "weekend" ? s.weekend_price : s.regular_price;
    const disc = discMap.get(`${e.student_id}:${e.subject_id}`) ?? discMap.get(`${e.student_id}:all`) ?? 0;
    const amount = Math.round(baseAmount * (100 - disc) / 100);
    toInsert.push({
      student_id: e.student_id,
      subject_id: e.subject_id,
      category: "monthly_fee",
      description: `Monthly fee — ${s.name} (${monthLabel})${disc ? ` (${disc}% off)` : ""}`,
      amount_pkr: amount,
      status: "issued",
      due_date: dueDate,
    });
  }
  if (toInsert.length) await admin.from("invoices").insert(toInsert).then(() => null, () => null);
  return { created: toInsert.length };
}
