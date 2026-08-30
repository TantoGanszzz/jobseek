import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset Password | JobSeek" };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
