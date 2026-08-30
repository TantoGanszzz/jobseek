"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { ActionState } from "./types";

/**
 * Updates the signed-in user's profile fields.
 * Works for every role — RLS limits the write to the caller's own row.
 */
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be logged in." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { ok: false, error: "Full name is required." };

  const supabase = await createClient();

  // Optional avatar upload (path convention: avatars/<user_id>/<file>).
  const avatarFile = formData.get("avatar");
  let avatarUrl: string | undefined;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      return { ok: false, error: "Avatar must be an image file." };
    }
    if (avatarFile.size > 2 * 1024 * 1024) {
      return { ok: false, error: "Avatar must be smaller than 2MB." };
    }
    const ext = avatarFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${user.userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });
    if (error) return { ok: false, error: `Avatar upload failed: ${error.message}` };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  const updates: Record<string, string | null> = {
    full_name: fullName,
    phone: String(formData.get("phone") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    education: String(formData.get("education") ?? "").trim() || null,
    experience: String(formData.get("experience") ?? "").trim() || null,
    position: String(formData.get("position") ?? "").trim() || null,
  };

  const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.userId);
  if (error) return { ok: false, error: error.message };

  if (avatarUrl) {
    const { error: avatarError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.userId);
    if (avatarError) return { ok: false, error: avatarError.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Profile updated successfully." };
}

/** Changes the account password after verifying the current one. */
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return {
      ok: false,
      error: "New password must be at least 8 characters and mix letters with numbers.",
    };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "New passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "You must be logged in." };

  // Verify the current password before switching it out.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };

  return { ok: true, message: "Password changed successfully." };
}
