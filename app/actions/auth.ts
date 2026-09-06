"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { onboardingRedirectTarget } from "@/lib/onboarding";

/** Resolve the post-sign-in destination from role + onboarding state. */
async function getPostSignInTarget(supabase: any, userId?: string): Promise<string> {
  let role: string | null = null;
  let onboardingCompleted = true;

  if (userId) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", userId)
        .maybeSingle();
      if (profile) {
        role = profile.role || null;
        if (profile.onboarding_completed != null) onboardingCompleted = !!profile.onboarding_completed;
      }
    } catch {}
  }

  const resolvedRole = role || "user";
  return onboardingRedirectTarget(resolvedRole, onboardingCompleted) || "/";
}

/** Map raw Supabase error messages to user-friendly strings. */
function mapSignInError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  if (lower.includes("rate") || lower.includes("too many")) {
    return "Too many attempts. Please try again in a moment.";
  }
  return "Unable to sign in. Please check your credentials and try again.";
}

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short") || lower.includes("at least"))) {
    return `Password is too weak. ${message}`;
  }
  if (lower.includes("rate") || lower.includes("too many")) {
    return "Too many attempts. Please try again in a moment.";
  }
  return "Unable to create account. Please try again.";
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapSignInError(error.message) };
  }

  redirect(await getPostSignInTarget(supabase, data.user?.id));
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const fullNameValue = formData.get("full_name");
  const fullName =
    typeof fullNameValue === "string" && fullNameValue.trim()
      ? fullNameValue.trim()
      : null;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const accountType = formData.get("account_type") as string;

  if (!phone) {
    return { error: "Nomor telepon wajib diisi." };
  }

  if (!accountType) {
    return { error: "Pilih tipe akun terlebih dahulu." };
  }

  const normalizedRole = accountType === "industry" ? "hrd" : "user";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...(fullName ? { full_name: fullName } : {}),
        phone,
        account_type: accountType,
        role: normalizedRole,
      },
    },
  });

  if (error) {
    return { error: mapSignUpError(error.message) };
  }

  // Create profile entry if user was created (idempotent: trigger also creates it)
  if (data.user) {
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        full_name: fullName,
        phone,
        role: normalizedRole,
        onboarding_completed: false,
        onboarding_step: 1,
      },
      { onConflict: "id" }
    );
  }

  // Branch on whether email confirmation is required
  if (data.session) {
    // Email confirmation disabled — user is signed in immediately.
    // Route new users to onboarding; existing users to their dashboard.
    redirect(await getPostSignInTarget(supabase, data.user?.id));
  }

  // Email confirmation required — session is null, user exists
  if (data.user && !data.session) {
    return {
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account before signing in.",
    };
  }

  // Fallback (should not reach here normally)
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
