import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In — Jobseek",
  description: "Masuk ke akun Jobseek Anda untuk mencari pekerjaan dan mengembangkan karier.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
