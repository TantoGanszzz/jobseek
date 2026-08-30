"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function validatePassword(pw: string): string | undefined {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "Password must contain both letters and numbers.";
  }
  return undefined;
}

export function ResetPasswordForm() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // The recovery link signs the user in (via /auth/callback or implicit hash).
  // Give the client a moment to pick up the session before deciding.
  useEffect(() => {
    let cancelled = false;
    async function check() {
      const supabase = createClient();
      let found: User | null = null;
      for (let i = 0; i < 6 && !found; i++) {
        const { data } = await supabase.auth.getUser();
        if (data.user) found = data.user;
        else await new Promise((r) => setTimeout(r, 500));
      }
      if (!cancelled) {
        setUser(found);
        setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: Record<string, string> = {};
    const pwError = validatePassword(password);
    if (pwError) nextErrors.password = pwError;
    if (confirm !== password) nextErrors.confirm = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setFormError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  if (checking) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-10 animate-pulse rounded bg-slate-100" />
        <div className="h-10 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Password updated
        </h1>
        <Alert kind="success">
          Your password has been changed successfully.
        </Alert>
        <Button
          className="w-full"
          onClick={() => {
            // Hard navigation: clears in-memory state after password change.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/jobs");
          }}
        >
          Continue to jobs
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reset password
        </h1>
        <Alert kind="warning">
          This reset link is invalid or has expired. Request a new one below.
        </Alert>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/forgot-password");
          }}
        >
          Request new link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      {formError && <Alert kind="error">{formError}</Alert>}

      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Min. 8 characters, letters + numbers"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoFocus
      />

      <Input
        label="Confirm new password"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Saving..." : "Update password"}
      </Button>
    </form>
  );
}
