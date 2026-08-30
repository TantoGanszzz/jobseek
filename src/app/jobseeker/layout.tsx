import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth/session";
import { getNavItems } from "@/lib/auth/nav";

export default async function JobseekerLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "job_seeker") {
    redirect("/login?next=/jobseeker/dashboard");
  }

  return (
    <DashboardShell
      items={getNavItems("job_seeker")}
      title="Job Seeker Dashboard"
      user={{
        name: user.profile.full_name,
        email: user.email,
        role: user.profile.role,
        avatarUrl: user.profile.avatar_url,
      }}
    >
      {children}
    </DashboardShell>
  );
}
