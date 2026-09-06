import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { adminNavGroups } from "@/lib/nav-config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let role = user.user_metadata?.role || "user";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role || role;
  } catch {}

  // Only ADMIN may access /admin
  if (role !== "admin") {
    redirect(role === "hrd" ? "/company/dashboard" : "/dashboard");
  }

  let name = user.user_metadata?.full_name || "";
  let avatarUrl: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();
    name = profile?.full_name || name;
    avatarUrl = profile?.avatar_url || null;
  } catch {}

  const email = user.email || "";
  const finalName = name || email.split("@")[0] || "Admin";

  const dashUser = {
    name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
    email,
    role: "Admin",
    avatarUrl,
  };

  return (
    <RoleDashboardShell navGroups={adminNavGroups} user={dashUser} brandLabel="Jobseek Admin">
      {children}
    </RoleDashboardShell>
  );
}