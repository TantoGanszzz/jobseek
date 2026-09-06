import { redirect } from "next/navigation";
import { getOnboardingStatus, onboardingRedirectTarget } from "@/lib/onboarding";

export default async function OnboardingIndexPage() {
  const status = await getOnboardingStatus();

  if (!status) {
    redirect("/login");
  }

  const target = onboardingRedirectTarget(status.role, status.onboarding_completed);
  redirect(target || "/dashboard");
}