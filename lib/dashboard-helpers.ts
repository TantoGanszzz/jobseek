import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/types/database.types";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

const PROFILE_METADATA_KEYS = [
  "full_name",
  "headline",
  "avatar_url",
  "phone",
  "location",
  "bio",
  "skills",
  "education",
  "university",
  "major",
  "github_url",
  "linkedin_url",
  "portfolio_url",
  "resume_url",
  "role",
] as const;

/**
 * Build a profile object from the authenticated user's own metadata
 * (auth.users.raw_user_meta_data). This avoids depending on a
 * public.profiles table that may not exist yet.
 */
export function getProfileFromAuthUser(
  user: { id?: string; user_metadata?: Record<string, unknown> } | null
): Partial<Profile> {
  const profile: Partial<Profile> = {
    id: user?.id ?? undefined,
  };
  const meta = (user?.user_metadata || {}) as Record<string, unknown>;
  for (const key of PROFILE_METADATA_KEYS) {
    const value = meta[key];
    if (value !== undefined && value !== null) {
      (profile as unknown as Record<string, unknown>)[key] = value;
    }
  }
  if (Array.isArray(profile.skills)) {
    profile.skills = (profile.skills as unknown[]).map(String);
  }
  return profile;
}

export async function getDashboardUser(): Promise<DashboardUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  let name = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const role = typeof metadata.role === "string" ? metadata.role : "user";
  const avatarUrl: string | null =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const nestedProfile =
    metadata.profile && typeof metadata.profile === "object"
      ? (metadata.profile as Record<string, unknown>)
      : null;
  if (!name && nestedProfile && typeof nestedProfile.full_name === "string") {
    name = nestedProfile.full_name as string;
  }

  const email = user.email || "";
  const finalName = name || email.split("@")[0] || "User";

  return {
    id: user.id,
    name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
    email,
    role,
    avatarUrl,
  };
}

export function calculateProfileStrength(profile: {
  full_name?: string | null;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  education?: string | null;
  university?: string | null;
  major?: string | null;
  skills?: string[] | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  resume_url?: string | null;
} | null): number {
  if (!profile) return 0;
  const fields: (keyof typeof profile)[] = [
    "full_name",
    "phone",
    "headline",
    "bio",
    "location",
    "education",
    "university",
    "major",
    "skills",
    "github_url",
    "linkedin_url",
    "portfolio_url",
    "resume_url",
  ];
  let filled = 0;
  for (const field of fields) {
    const val = profile[field];
    if (val !== null && val !== undefined && val !== "") {
      if (Array.isArray(val) && val.length === 0) continue;
      filled++;
    }
  }
  return Math.round((filled / fields.length) * 100);
}
