"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Atom, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EnforceTheme from "@/components/EnforceTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    // New sign-ups default to the "student" role. Admin/teacher accounts are
    // provisioned by a Super Admin, never via public registration.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: "student" },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, a session exists immediately.
    if (data.session) {
      router.push("/dashboard/student");
      router.refresh();
      return;
    }

    setMessage(
      "Check your inbox to confirm your email, then sign in to get started.",
    );
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <EnforceTheme mode="light" />
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Atom className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Rabee Academia</span>
        </Link>

        <div className="bg-card border border-card-border rounded-xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Join Rabee Academia and start learning today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ali Ahmed"
                required
              />
            </div>

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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-accent" role="status">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
