"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Atom, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password },
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const role = (data.user?.app_metadata?.role ??
      data.user?.user_metadata?.role) as UserRole | undefined;
    const redirectedFrom = searchParams.get("redirectedFrom");
    router.push(
      redirectedFrom || (role ? ROLE_HOME[role] : "/dashboard/student"),
    );
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Atom className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg">Rabee Academia</span>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to continue your learning journey.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-medium">
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
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
