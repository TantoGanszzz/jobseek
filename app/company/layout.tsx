import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { hrdNavGroups } from "@/lib/nav-config";

// HRD / Company workspace layout.
// Authorization is resolved purely from auth.users.user_metadata (role is set
// at signup and preserved in stored metadata), so no profile table is needed.
export default async function CompanyLayout({
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

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const role = typeof metadata.role === "string" ? metadata.role : "user";
  const onboardingCompleted = metadata.onboarding_completed !== false;

  // Only HRD (or admin) may access /company
  if (role !== "hrd" && role !== "admin") {
    redirect("/dashboard");
  }

  // HRD must finish onboarding before entering the company dashboard
  if (role === "hrd" && !onboardingCompleted) {
    redirect("/onboarding/hrd");
  }

  const name = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const email = user.email || "";
  const finalName = name || email.split("@")[0] || "HRD";
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const dashUser = {
    name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
    email,
    role: "HRD",
    avatarUrl,
  };

  const notifications: [] = [];

  return (
    <RoleDashboardShell navGroups={hrdNavGroups} user={dashUser} brandLabel="Jobseek HRD" notifications={notifications}>
      {children}
    </RoleDashboardShell>
  );
}
