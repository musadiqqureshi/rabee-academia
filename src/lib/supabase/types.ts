// Application-level enums and shared types for Rabee Academia.

// 'super_admin' is deprecated — all its powers now belong to 'admin'. It is kept
// in the union only for DB/enum compatibility; the app treats it as admin and
// routes it to the admin portal.
export type UserRole = "super_admin" | "admin" | "teacher" | "student";

// Roles offered in the UI (super_admin intentionally excluded).
export const USER_ROLES: UserRole[] = ["admin", "teacher", "student"];

// Maps each role to its dashboard landing route.
export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/dashboard/admin",
  admin: "/dashboard/admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
};

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  student_code?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Phase 2 — Academic Management
// ---------------------------------------------------------------------------

export type SubmissionType = "portal" | "google_drive";
export type SubmissionStatus = "draft" | "submitted" | "graded" | "returned";
export type QuizQuestionType =
  | "mcq"
  | "true_false"
  | "short_answer"
  | "long_answer"
  | "file_upload";
export type QuizAttemptStatus = "in_progress" | "submitted" | "graded";
export type GradingMode = "manual" | "ai";
export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled";
export type InvoiceCategory =
  | "registration"
  | "monthly_fee"
  | "special_class"
  | "exam_fee";

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  graded: "Graded",
  returned: "Returned for revision",
};

export const QUIZ_QUESTION_TYPE_LABEL: Record<QuizQuestionType, string> = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  file_upload: "File Upload",
};

export const INVOICE_CATEGORY_LABEL: Record<InvoiceCategory, string> = {
  registration: "Course Registration",
  monthly_fee: "Monthly Fee",
  special_class: "Special Class",
  exam_fee: "Exam Fee",
};

export interface Assignment {
  id: string;
  batch_id: string;
  teacher_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  total_marks: number;
  submission_type: SubmissionType;
  resource_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  drive_url: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  marks_obtained: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  batch_id: string;
  teacher_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  attempt_limit: number;
  passing_score: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  grading_mode: GradingMode;
  available_from: string | null;
  available_until: string | null;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_type: QuizQuestionType;
  prompt: string;
  options: QuizQuestionOption[] | null;
  correct_answer: string | null;
  marks: number;
  position: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  status: QuizAttemptStatus;
  answers: Record<string, string>;
  score: number | null;
  max_score: number | null;
  feedback: string | null;
  ai_graded: boolean;
  started_at: string;
  submitted_at: string | null;
  graded_by: string | null;
  graded_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  enrollment_id: string | null;
  subject_id: string | null;
  category: InvoiceCategory;
  description: string | null;
  amount_pkr: number;
  status: InvoiceStatus;
  due_date: string | null;
  issued_at: string;
  paid_at: string | null;
  created_at: string;
}
