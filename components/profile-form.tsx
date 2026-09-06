"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationAutocompleteInput from "@/components/location-autocomplete-input";
import { updateProfile, changePassword } from "@/app/actions/profile";
import type { Profile } from "@/types/database.types";
import { Save, Lock, X, Plus } from "lucide-react";

interface ProfileFormProps {
  profile: Profile | null;
  email: string;
}

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const [profileFields, setProfileFields] = useState({
    full_name: profile?.full_name ?? "",
    headline: profile?.headline ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    bio: profile?.bio ?? "",
    education: profile?.education ?? "",
    university: profile?.university ?? "",
    major: profile?.major ?? "",
    github_url: profile?.github_url ?? "",
    linkedin_url: profile?.linkedin_url ?? "",
    portfolio_url: profile?.portfolio_url ?? "",
  });
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pwMessage, setPwMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  function setField(field: keyof typeof profileFields, value: string) {
    setProfileFields((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleProfileSubmit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    setMessage(null);

    // Add skills to form data
    formData.set("skills", JSON.stringify(skills));
    formData.set("location", profileFields.location);

    try {
      const result = await updateProfile(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully." });
        router.refresh();
        // Show the saved state briefly, then land on the updated career matches.
        window.setTimeout(() => {
          router.push("/dashboard/career?saved=1");
        }, 500);
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-brand-border p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-navy mb-6">
          Informasi Profil
        </h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form action={handleProfileSubmit} className="space-y-5">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-navy/10 border border-brand-border flex items-center justify-center text-xl font-bold text-navy">
              {profileFields.full_name[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-navy">Foto Profil</p>
              <p className="text-xs text-muted-foreground">
                Upload foto untuk profil Anda (coming soon)
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-navy"
              >
                Nama Lengkap
              </label>
              <Input
                id="full_name"
                name="full_name"
                value={profileFields.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                placeholder="Nama lengkap"
                className="h-11 border-brand-border"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navy"
              >
                Email
              </label>
              <Input
                id="email"
                value={email}
                disabled
                className="h-11 border-brand-border bg-light-bg text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-navy"
            >
              Headline Profesional
            </label>
            <Input
              id="headline"
              name="headline"
              value={profileFields.headline}
              onChange={(e) => setField("headline", e.target.value)}
              placeholder="Frontend Developer | UI/UX Enthusiast"
              className="h-11 border-brand-border"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-navy"
              >
                Nomor Telepon
              </label>
              <Input
                id="phone"
                name="phone"
                value={profileFields.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+62..."
                className="h-11 border-brand-border"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-navy"
              >
                Lokasi
              </label>
              <LocationAutocompleteInput
                id="location"
                name="location"
                value={profileFields.location}
                onValueChange={(v) => setField("location", v)}
                placeholder="Jakarta, Indonesia"
                className="h-11 border-brand-border"
                wrapperClassName="space-y-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-navy"
            >
              Ringkasan / Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={profileFields.bio}
              onChange={(e) => setField("bio", e.target.value)}
              placeholder="Ceritakan tentang diri Anda..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy transition-colors resize-none"
            />
          </div>

          {/* Education */}
          <div className="space-y-2">
            <label htmlFor="education" className="block text-sm font-medium text-navy">
              Education Level
            </label>
            <Input
              id="education"
              name="education"
              value={profileFields.education}
              onChange={(e) => setField("education", e.target.value)}
              placeholder="S1 / Sarjana"
              className="h-11 border-brand-border"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-navy">
                School / University
              </label>
              <Input
                id="university"
                name="university"
                value={profileFields.university}
                onChange={(e) => setField("university", e.target.value)}
                placeholder="Universitas Indonesia"
                className="h-11 border-brand-border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="major" className="block text-sm font-medium text-navy">
                Major
              </label>
              <Input
                id="major"
                name="major"
                value={profileFields.major}
                onChange={(e) => setField("major", e.target.value)}
                placeholder="Computer Science"
                className="h-11 border-brand-border"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label htmlFor="github_url" className="block text-sm font-medium text-navy">
                GitHub
              </label>
              <Input
                id="github_url"
                name="github_url"
                value={profileFields.github_url}
                onChange={(e) => setField("github_url", e.target.value)}
                placeholder="https://github.com/..."
                className="h-11 border-brand-border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-navy">
                LinkedIn
              </label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                value={profileFields.linkedin_url}
                onChange={(e) => setField("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="h-11 border-brand-border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="portfolio_url" className="block text-sm font-medium text-navy">
                Portfolio
              </label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                value={profileFields.portfolio_url}
                onChange={(e) => setField("portfolio_url", e.target.value)}
                placeholder="https://..."
                className="h-11 border-brand-border"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-navy">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-navy/5 text-navy rounded-full border border-brand-border"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Tambah skill (misal: React)"
                className="h-10 border-brand-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="h-10 border-brand-border text-navy cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-navy text-white hover:bg-navy-light font-medium h-11 px-6 cursor-pointer"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-brand-border p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-navy mb-6">Ganti Password</h2>

        {pwMessage && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              pwMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {pwMessage.text}
          </div>
        )}

        <form action={handlePasswordSubmit} className="space-y-5 max-w-md">
          <div className="space-y-2">
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
          <div className="space-y-2">
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
    </div>
  );
}
