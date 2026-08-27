import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign Up — Jobseek",
  description: "Buat akun Jobseek untuk memulai pencarian pekerjaan dan pengembangan karier Anda.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
