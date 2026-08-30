import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges the PKCE `code` from Supabase email links (signup confirmation,
 * password recovery, magic link) for a session, then redirects onward.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Missing/expired code — send to reset-password when that was the intent,
  // otherwise back to login with an error flag.
  if (next === "/reset-password") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
