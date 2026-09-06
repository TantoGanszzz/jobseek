import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { onboardingRedirectTarget } from "@/lib/onboarding";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let target = next;
      if (user) {
        let role = user.user_metadata?.role || "user";
        let onboardingCompleted = true;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, onboarding_completed")
            .eq("id", user.id)
            .maybeSingle();
          if (profile) {
            role = profile.role || role;
            if (profile.onboarding_completed != null) onboardingCompleted = !!profile.onboarding_completed;
          }
        } catch {}
        const resolved = onboardingRedirectTarget(role, onboardingCompleted);
        if (resolved) target = resolved;
      }

      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
