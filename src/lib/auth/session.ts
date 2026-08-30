import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export interface CurrentUser {
  userId: string;
  email: string;
  profile: Profile;
}

/**
 * Returns the authenticated user with their profile, or null.
 * Cached per request so multiple components can call it safely.
 */
export const getCurrentUser = cache(
  async (): Promise<CurrentUser | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      return {
        userId: user.id,
        email: user.email ?? profile.email,
        profile: profile as Profile,
      };
    }

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fallback: Profile = {
      id: user.id,
      user_id: user.id,
      full_name: (meta.full_name as string) ?? user.email ?? "User",
      email: user.email ?? "",
      role: ((meta.role as UserRole) ?? "job_seeker") as UserRole,
      avatar_url: (meta.avatar_url as string) ?? null,
      phone: null,
      bio: null,
      location: null,
      education: null,
      experience: null,
      position: null,
      cv_url: null,
      created_at: user.created_at ?? "",
      updated_at: user.created_at ?? "",
    };

    return {
      userId: user.id,
      email: user.email ?? fallback.email,
      profile: fallback,
    };
  }
);

export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== role) {
    throw new Error("Unauthorized");
  }
  return user;
}
