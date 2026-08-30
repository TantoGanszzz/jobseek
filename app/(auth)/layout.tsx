import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobseek — Autentikasi",
  description: "Masuk atau daftar ke Jobseek untuk memulai pencarian karier Anda.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
