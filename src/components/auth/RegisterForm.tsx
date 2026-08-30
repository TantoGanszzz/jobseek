"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type Role = "job_seeker" | "hrd";

function validatePassword(pw: string): string | undefined {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "Password must contain both letters and numbers.";
  }
  return undefined;
}

export function RegisterForm() {
  const [role, setRole] = useState<Role>("job_seeker");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessEmail(null);

    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (role === "hrd" && !companyName.trim())
      nextErrors.companyName = "Company name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      nextErrors.email = "Enter a valid email address.";
    const pwError = validatePassword(password);
    if (pwError) nextErrors.password = pwError;
    if (confirm !== password) nextErrors.confirm = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            company_name: role === "hrd" ? companyName.trim() : undefined,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("already registered") || m.includes("already exists")) {
          setFormError("This email is already registered. Try logging in instead.");
        } else {
          setFormError(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Email confirmation disabled — user is signed in right away.
        window.location.assign(role === "hrd" ? "/hrd/dashboard" : "/jobseeker/dashboard");
        return;
      }

      setLoading(false);
      setSuccessEmail(email.trim());
    } catch {
      setFormError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (successEmail) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Check your inbox
        </h1>
        <Alert kind="success">
          We sent a confirmation link to <strong>{successEmail}</strong>. Click
          the link to activate your account, then log in.
        </Alert>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // Hard navigation: clears in-memory state after signup.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/login";
          }}
        >
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Join JobSeek as a job seeker or an HR professional.
        </p>
      </div>

      {formError && <Alert kind="error">{formError}</Alert>}

      {/* Role picker */}
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-slate-700">
          I am a<span className="text-cyan-600"> *</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "job_seeker", title: "Job Seeker", desc: "Find & apply for jobs" },
              { value: "hrd", title: "HRD", desc: "Post jobs & hire talent" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              aria-pressed={role === opt.value}
              className={cn(
                "rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600",
                role === opt.value
                  ? "border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500"
                  : "border-slate-300 bg-white hover:border-cyan-300"
              )}
            >
              <span className="block text-sm font-semibold text-slate-900">
                {opt.title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <Input
        label="Full name"
        name="full_name"
        autoComplete="name"
        placeholder="John Doe"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        required
      />

      {role === "hrd" && (
        <Input
          label="Company name"
          name="company_name"
          autoComplete="organization"
          placeholder="Acme Inc."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          error={errors.companyName}
          required
        />
      )}

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
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Min. 8 characters, letters + numbers"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint="At least 8 characters with a mix of letters and numbers."
        required
      />

      <Input
        label="Confirm password"
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
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-cyan-600 hover:text-cyan-700">
          Log in
        </a>
      </p>
    </form>
  );
}
