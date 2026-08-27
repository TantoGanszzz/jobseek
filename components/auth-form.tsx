"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/app/actions/auth";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm_password") as string;

        if (password !== confirmPassword) {
          setError("Password dan konfirmasi password tidak cocok.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password minimal 6 karakter.");
          setLoading(false);
          return;
        }
      }

      const result = mode === "login" ? await signIn(formData) : await signUp(formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happened (success case) - this is expected
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-navy tracking-tight">
            Jobseek
          </h1>
        </Link>
        <p className="text-muted-foreground mt-2 text-sm">
          {mode === "login"
            ? "Masuk ke akun Anda"
            : "Buat akun baru untuk memulai"}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-navy"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  className="pl-10 h-11 border-brand-border focus:border-navy focus:ring-navy"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-navy"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="pl-10 h-11 border-brand-border focus:border-navy focus:ring-navy"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-navy"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                required
                className="pl-10 pr-10 h-11 border-brand-border focus:border-navy focus:ring-navy"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-navy"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  required
                  className="pl-10 pr-10 h-11 border-brand-border focus:border-navy focus:ring-navy"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
                  aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-navy text-white hover:bg-navy-light font-medium rounded-lg transition-colors cursor-pointer"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <p>
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-medium text-navy hover:underline"
              >
                Sign Up
              </Link>
            </p>
          ) : (
            <p>
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-navy hover:underline"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
