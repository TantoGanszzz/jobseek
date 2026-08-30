import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/DataDisplay";

export const metadata: Metadata = { title: "Login | JobSeek" };

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LoginForm/>
    </Suspense>
  );
}
