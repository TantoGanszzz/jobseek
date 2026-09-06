import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    const res = NextResponse.next({ request });
    res.headers.set("x-next-pathname", request.nextUrl.pathname);
    return res;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT remove auth.getUser()
  // This refreshes the session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  let resolvedRole: string | null = null;
  let onboardingCompleted = true;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const accountType = user.user_metadata?.account_type;
    resolvedRole =
      profile?.role ??
      user.user_metadata?.role ??
      (accountType === "industry"
        ? "hrd"
        : accountType === "worker"
          ? "user"
          : null);

    if (profile && profile.onboarding_completed != null) {
      onboardingCompleted = !!profile.onboarding_completed;
    }
  }

  const isDashboardPath = pathname.startsWith("/dashboard");
  const isCompanyPath = pathname.startsWith("/company");
  const isAdminPath = pathname.startsWith("/admin");
  const isOnboardingPath = pathname.startsWith("/onboarding");
  const isProtectedPath = isDashboardPath || isCompanyPath || isAdminPath || isOnboardingPath || pathname.startsWith("/profile");

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isProtectedPath) {
    const role = resolvedRole || "user";

    // Onboarding routes: admins skipped, completed users skip (except result pages)
    if (isOnboardingPath) {
      const isResultPath =
        pathname === "/onboarding/user/recommendations" ||
        pathname === "/onboarding/hrd/complete";
      if (role === "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
      if (onboardingCompleted && !isResultPath) {
        const url = request.nextUrl.clone();
        url.pathname = role === "hrd" ? "/company/dashboard" : "/dashboard";
        return NextResponse.redirect(url);
      }
      // Route to the correct onboarding variant for the role
      const expectedPath = role === "hrd" ? "/onboarding/hrd" : "/onboarding/user";
      if (!pathname.startsWith(expectedPath)) {
        const url = request.nextUrl.clone();
        url.pathname = expectedPath;
        return NextResponse.redirect(url);
      }
    }

    // Busy: not completed onboarding cannot enter dashboards
    if (!onboardingCompleted && !isOnboardingPath) {
      const url = request.nextUrl.clone();
      url.pathname = role === "hrd" ? "/onboarding/hrd" : "/onboarding/user";
      return NextResponse.redirect(url);
    }

    if (isAdminPath && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "hrd" ? "/company/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isCompanyPath && role !== "hrd" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isDashboardPath && role !== "user") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/company/dashboard";
      return NextResponse.redirect(url);
    }
  }

  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some(
    (path) => request.nextUrl.pathname === path
  );

  if (user && isAuthPath) {
    const role = resolvedRole || "user";
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : role === "hrd" ? "/company/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  supabaseResponse.headers.set("x-next-pathname", pathname);
  return supabaseResponse;
}
