import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { userNavGroups, employeeWorkspaceNavGroups } from "@/lib/nav-config";
import type { NavGroup } from "@/components/role-dashboard-shell";

export default async function DashboardLayout({
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

  // Only USER role may access /dashboard
  if (role === "hrd") {
    redirect("/company/dashboard");
  }
  if (role === "admin") {
    redirect("/admin");
  }
  if (!onboardingCompleted) {
    redirect("/onboarding/user");
  }

  const name = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const email = user.email || "";
  const finalName = name || email.split("@")[0] || "Candidate";

  const dashUser = {
    name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
    email,
    role: "User",
    avatarUrl,
  };

  // Hired candidates (an Employee record now exists) get an extra Workspace
  // section with their tasks, projects, messages, calendar, and announcements.
  const isEmployee = false;
  const navGroups: NavGroup[] = isEmployee
    ? [...userNavGroups, ...employeeWorkspaceNavGroups]
    : userNavGroups;

  const notifications: [] = [];

  return (
    <RoleDashboardShell navGroups={navGroups} user={dashUser} brandLabel="Jobseek" notifications={notifications}>
      {children}
    </RoleDashboardShell>
  );
}
