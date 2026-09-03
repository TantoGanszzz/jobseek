"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapSignInError(error.message) };
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: mapSignUpError(error.message) };
  }

  // Create profile entry if user was created
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
    });
  }

  // Branch on whether email confirmation is required
  if (data.session) {
    // Email confirmation disabled — user is signed in immediately
    redirect("/");
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
