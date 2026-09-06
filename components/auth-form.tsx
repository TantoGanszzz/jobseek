"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/app/actions/auth";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
} from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

type AccountType = "worker" | "industry";

const accountTypes: Array<{
  value: AccountType;
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
}> = [
  {
    value: "worker",
    title: "Pekerja",
    description: "Cari dan lamar pekerjaan yang sesuai dengan skill Anda.",
    icon: BriefcaseBusiness,
  },
  {
    value: "industry",
    title: "Industri",
    description: "Pasang lowongan dan temukan talenta yang tepat.",
    icon: Building2,
  },
];

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(
    null
  );
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(mode === "register");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === "register") {
        if (!selectedAccountType) {
          setError("Pilih tipe akun terlebih dahulu.");
          setLoading(false);
          return;
        }

        const phone = formData.get("phone") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm_password") as string;

        if (!phone) {
          setError("Nomor telepon wajib diisi.");
          setLoading(false);
          return;
        }

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

        formData.set("account_type", selectedAccountType);
      }

      const result = mode === "login" ? await signIn(formData) : await signUp(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result && "success" in result && result.success && "message" in result) {
        // Registration successful but email verification required
        setSuccessMessage(result.message as string);
      }
    } catch {
      // Redirect happened (success case) - this is expected
    } finally {
      setLoading(false);
    }
  }

  // If registration succeeded with email verification required, show success message
  if (successMessage) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-navy tracking-tight">
              Jobseek
            </h1>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-navy">
              Verifikasi Email
            </h2>
            <p className="text-sm text-muted-foreground">
              {successMessage}
            </p>
            <Link href="/login">
              <Button className="mt-2 bg-navy text-white hover:bg-navy-light font-medium cursor-pointer">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
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

      {mode === "register" && showAccountTypeModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-brand-border bg-white shadow-2xl">
            <div className="h-1 bg-navy" />
            <div className="p-6 sm:p-8">
              <div className="mb-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy">
                  Bergabung dengan Jobseek
                </p>
                <h2 className="mt-3 text-2xl font-bold text-navy sm:text-[1.75rem]">
                  Pilih tipe akun Anda
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pilih salah satu sebelum melanjutkan ke email, password, dan nomor telepon.
                </p>
              </div>

              <div className="space-y-4">
                {accountTypes.map((accountType) => {
                  const Icon = accountType.icon;
                  const isSelected = selectedAccountType === accountType.value;

                  return (
                    <button
                      key={accountType.value}
                      type="button"
                      onClick={() => setSelectedAccountType(accountType.value)}
                      className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected
                          ? "border-navy ring-2 ring-navy/15"
                          : "border-brand-border hover:border-navy/30"
                      }`}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-white shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-navy">
                            {accountType.title}
                          </h3>
                          {accountType.value === "industry" && (
                            <span className="rounded-full border border-brand-border bg-light-bg px-2 py-0.5 text-[11px] font-medium text-navy">
                              Untuk perusahaan
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {accountType.description}
                        </p>
                      </div>
                      <Check
                        className={`h-5 w-5 text-navy transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    router.push("/");
                  }}
                  className="h-11 flex-1 border-brand-border text-navy hover:bg-light-bg cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (!selectedAccountType) {
                      setError("Pilih tipe akun terlebih dahulu.");
                      return;
                    }

                    setShowAccountTypeModal(false);
                  }}
                  className="h-11 flex-1 bg-navy text-white hover:bg-navy-light cursor-pointer"
                >
                  Lanjutkan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className={`rounded-xl border border-brand-border bg-white p-8 shadow-sm transition-all ${
          mode === "register" && showAccountTypeModal
            ? "pointer-events-none select-none blur-[1px]"
            : ""
        }`}
      >
        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <input type="hidden" name="account_type" value={selectedAccountType || ""} />
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

          {mode === "register" && (
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-navy"
              >
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  required
                  className="pl-10 h-11 border-brand-border focus:border-navy focus:ring-navy"
                />
              </div>
            </div>
          )}

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
            disabled={loading || (mode === "register" && !selectedAccountType)}
            className="w-full h-11 bg-navy text-white hover:bg-navy-light font-medium rounded-lg transition-colors cursor-pointer"
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Sign In"
              : "Lanjutkan"}
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
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Setelah ini, Anda bisa melengkapi data profil lainnya.
              </p>
              <p>
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-medium text-navy hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
