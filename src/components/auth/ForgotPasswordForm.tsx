"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Check your inbox
        </h1>
        <Alert kind="success">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
          password reset link. It expires shortly, so use it soon.
        </Alert>
        <a
          href="/login"
          className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Forgot password?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Remembered it?{" "}
        <a href="/login" className="font-medium text-cyan-600 hover:text-cyan-700">
          Log in
        </a>
      </p>
    </form>
  );
}
