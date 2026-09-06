import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobseek — Build Your Career. Find Your Future.",
  description:
    "Platform pencarian pekerjaan dan pengembangan karier untuk pelajar, mahasiswa, fresh graduate, dan pencari kerja pemula di Indonesia.",
  keywords: [
    "job search",
    "career",
    "fresh graduate",
    "internship",
    "lowongan kerja",
    "karier",
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Get user session for navbar
  let user = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      // Try to get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", authUser.id)
        .single();

      user = {
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
      };
    }
  } catch {
    // Supabase not configured yet — that's okay, show guest navbar
  }

  // Hide the public navbar/footer on dashboard and admin routes to allow the role-specific shell to take over.
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") || "";
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/company") ||
    pathname.startsWith("/admin");

  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {!isDashboardRoute && <Navbar user={user} />}
        <main className="flex-1">{children}</main>
        {!isDashboardRoute && <Footer />}
      </body>
    </html>
  );
}
