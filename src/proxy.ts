import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, type UserRole } from "@/types/database";

const PROTECTED_PREFIXES = ["/admin", "/hrd", "/jobseeker"] as const;

const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

function roleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/hrd")) return "hrd";
  if (pathname.startsWith("/jobseeker")) return "job_seeker";
  return null;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the JWT with the auth server (not just decoding it).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  let role: UserRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    role =
      (profile?.role as UserRole) ??
      (user.user_metadata?.role as UserRole | undefined) ??
      null;
  }

  // Unauthenticated users are bounced to login (remember where they wanted to go).
  if (!user || !role) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Authenticated users skip the auth pages.
  if (!isProtected && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    url.search = "";
    return NextResponse.redirect(url);
  }

  // A signed-in user may only enter the area that matches their role.
  const requiredRole = roleFromPath(pathname);
  if (requiredRole && requiredRole !== role) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets, images and metadata files.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
