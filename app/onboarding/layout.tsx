import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOnboardingStatus, onboardingRedirectTarget } from "@/lib/onboarding";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getOnboardingStatus();

  if (!status) {
    redirect("/login");
  }

  const headersList = await headers();
  const path = headersList.get("x-next-pathname") || "";
  const isResultPage =
    path === "/onboarding/user/recommendations" || path === "/onboarding/hrd/complete";

  if (status.role === "admin") {
    redirect("/admin");
  }

  if (status.onboarding_completed && !isResultPage) {
    const target = onboardingRedirectTarget(status.role, true);
    if (target) redirect(target);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              J
            </span>
            <span className="text-lg font-bold text-navy">Jobseek</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-3xl">{children}</div>
      </main>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Jobseek. Build your professional future.
      </footer>
    </div>
  );
}