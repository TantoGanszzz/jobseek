"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Your account is not active yet. Please check your inbox to confirm your email.";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message;
}

export function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(mapAuthError(error.message));
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const role =
        (profile?.role as UserRole) ??
        (data.user.user_metadata?.role as UserRole | undefined) ??
        "job_seeker";
      const home =
        role === "admin"
          ? "/admin/dashboard"
          : role === "hrd"
            ? "/hrd/dashboard"
            : "/jobseeker/dashboard";

      const nextParam = searchParams.get("next");
      const destination =
        nextParam && nextParam.startsWith("/") ? nextParam : home;

      // Full reload so the proxy picks up the fresh session cookies.
      window.location.assign(destination);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log in to continue your job search.
        </p>
      </div>

      {searchParams.get("error") === "auth" && (
        <Alert kind="error">
          Authentication link is invalid or expired. Please try again.
        </Alert>
      )}
      {formError && <Alert kind="error">{formError}</Alert>}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        autoFocus
      />

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-9 right-3 rounded-md p-1 text-slate-400 transition-colors hover:text-cyan-600 focus-visible:outline-2 focus-visible:outline-cyan-600"
          >
            {showPassword ? (
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Remember me
        </label>
        <a href="/forgot-password" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
          Forgot password?
        </a>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <a href="/register" className="font-medium text-cyan-600 hover:text-cyan-700">
          Sign up
        </a>
      </p>
    </form>
  );
}
