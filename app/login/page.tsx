"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Atom, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EnforceTheme from "@/components/EnforceTheme";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email: email.trim().toLowerCase(), password }
    );

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : signInError.message
      );
      setLoading(false);
      return;
    }

    // Read role from profiles table via the session
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role =
      (profile?.role as UserRole | undefined) ??
      (data.user?.app_metadata?.role as UserRole | undefined) ??
      (data.user?.user_metadata?.role as UserRole | undefined);

    const redirectedFrom = searchParams.get("redirectedFrom");
    router.push(
      redirectedFrom ?? (role ? ROLE_HOME[role] : "/dashboard/student")
    );
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Atom className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg">Rabee Academia</span>
      </Link>

      <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to continue your learning journey.
        </p>

        {/* URL error (e.g. auth callback failed) */}
        {urlError && !error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            Session expired. Please sign in again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <EnforceTheme mode="light" />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
