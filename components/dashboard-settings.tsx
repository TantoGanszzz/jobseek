"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/app/actions/profile";
import { signOut } from "@/app/actions/auth";
import {
  Settings,
  Mail,
  Calendar,
  Lock,
  LogOut,
  Shield,
} from "lucide-react";

interface SettingsClientProps {
  email: string;
  createdAt: string;
}

export default function SettingsClient({ email, createdAt }: SettingsClientProps) {
  const [pwMessage, setPwMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handlePasswordSubmit(formData: FormData) {
    setPwLoading(true);
    setPwMessage(null);

    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (newPassword !== confirmPassword) {
      setPwMessage({
        type: "error",
        text: "Password baru dan konfirmasi tidak cocok.",
      });
      setPwLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPwMessage({
        type: "error",
        text: "Password minimal 6 karakter.",
      });
      setPwLoading(false);
      return;
    }

    try {
      const result = await changePassword(formData);
      if (result?.error) {
        setPwMessage({ type: "error", text: result.error });
      } else {
        setPwMessage({ type: "success", text: "Password berhasil diubah!" });
      }
    } catch {
      setPwMessage({ type: "error", text: "Terjadi kesalahan." });
    } finally {
      setPwLoading(false);
    }
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Kelola pengaturan dan keamanan akun Anda.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informasi Akun
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-light-bg rounded-lg">
              <Mail className="h-5 w-5 text-navy/50 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-navy">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-light-bg rounded-lg">
              <Calendar className="h-5 w-5 text-navy/50 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Akun Dibuat</p>
                <p className="text-sm font-medium text-navy">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Ganti Password
          </h2>

          {pwMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                pwMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {pwMessage.text}
            </div>
          )}

          <form action={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-navy"
              >
                Password Baru
              </label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                placeholder="Minimal 6 karakter"
                required
                className="h-11 border-brand-border"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-navy"
              >
                Konfirmasi Password Baru
              </label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Ulangi password baru"
                required
                className="h-11 border-brand-border"
              />
            </div>
            <Button
              type="submit"
              disabled={pwLoading}
              variant="outline"
              className="border-navy text-navy hover:bg-navy hover:text-white font-medium h-11 px-6 cursor-pointer"
            >
              <Lock className="mr-2 h-4 w-4" />
              {pwLoading ? "Mengubah..." : "Ganti Password"}
            </Button>
          </form>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-xl border border-red-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Keluar
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Anda akan keluar dari akun dan diarahkan ke halaman login.
          </p>
          <Button
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await signOut();
            }}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {signingOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
