// Shared constants & helpers for the instructor application / screening system.

export const APPLICATION_FEE = 1000;          // PKR
export const PASS_MARK = 70;                  // % needed to qualify
export const MCQ_WEIGHT = 0.7;                // MCQ share of the combined score
export const LONG_WEIGHT = 0.3;               // long-answer share
export const MCQ_COUNT = 12;                  // hard MCQs generated
export const LONG_COUNT = 2;                  // long-answer questions

export type ApplicationStatus =
  | "submitted"
  | "payment_submitted"
  | "test_unlocked"
  | "test_submitted"
  | "qualified"
  | "not_qualified"
  | "interview_scheduled"
  | "hired"
  | "rejected";

export type PaymentStatus = "pending" | "verified" | "rejected";

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "Application started",
  payment_submitted: "Payment under review",
  test_unlocked: "Test unlocked",
  test_submitted: "Test submitted",
  qualified: "Qualified 🎉",
  not_qualified: "Not qualified",
  interview_scheduled: "Interview scheduled",
  hired: "Hired",
  rejected: "Rejected",
};

export interface InstructorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject_slug: string | null;
  subject_name: string;
  qualifications: string | null;
  code: string;
  fee_amount: number;
  payment_method: string | null;
  receipt_url: string | null;
  payment_status: PaymentStatus;
  status: ApplicationStatus;
  score: number | null;
  passed: boolean | null;
  interview_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Public (answer-stripped) shapes the candidate's browser is allowed to see.
export interface PublicMcq { q: string; options: string[] }
export interface PublicTest { mcqs: PublicMcq[]; long: { prompt: string }[] }

// Full shape stored server-side (never sent to the candidate).
export interface FullMcq { q: string; options: string[]; answer: number; explanation?: string }
export interface FullTest { mcqs: FullMcq[]; long: { prompt: string }[] }

// "INS-AB12CD" — short, human-readable application code.
export function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `INS-${s}`;
}

export function combinedScore(mcqPct: number, longPct: number): number {
  return Math.round(MCQ_WEIGHT * mcqPct + LONG_WEIGHT * longPct);
}
