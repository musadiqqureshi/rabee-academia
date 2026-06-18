// Application-level enums and shared types for Rabee Academia.

export type UserRole = "super_admin" | "admin" | "teacher" | "student";

export const USER_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "teacher",
  "student",
];

// Maps each role to its dashboard landing route.
export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/dashboard/super-admin",
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
  created_at: string;
}
