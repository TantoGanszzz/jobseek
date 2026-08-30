"use client";

import { useState, type FormEvent } from "react";
import { Bell, CircleCheck, KeyRound, UserRound } from "lucide-react";
import { Avatar, Card, PageHeader } from "@/components/demo/ui";
import { skillProfile } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

type Tab = "profil" | "keamanan" | "notifikasi";

const tabs: { id: Tab; label: string; icon: typeof UserRound }[] = [
  { id: "profil", label: "Profil", icon: UserRound },
  { id: "keamanan", label: "Keamanan", icon: KeyRound },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
];

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-cyan-500" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profil");
  const [name, setName] = useState(skillProfile.name);
  const [title, setTitle] = useState(skillProfile.title);
  const [location, setLocation] = useState(skillProfile.location);
  const [saved, setSaved] = useState(false);

  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(true);
  const [digest, setDigest] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" subtitle="Kelola profil, keamanan akun, dan preferensi notifikasi kamu." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Nav */}
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-card lg:h-fit lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/25"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tab === "profil" && (
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Avatar initials="AP" color="bg-cyan-500" size="lg" className="h-14 w-14 text-lg" />
                <div>
                  <p className="text-base font-extrabold text-slate-900">{name}</p>
                  <p className="text-sm text-cyan-600">{title}</p>
                  <button type="button" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-cyan-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    Ganti foto
                  </button>
                </div>
              </div>

              <form onSubmit={save} className="mt-6 space-y-4">
                <Field label="Nama Lengkap" name="name" value={name} onChange={setName} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Posisi saat ini" name="title" value={title} onChange={setTitle} />
                  <Field label="Lokasi" name="location" value={location} onChange={setLocation} />
                </div>
                <button
                  type="submit"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors",
                    saved ? "bg-green-500" : "bg-cyan-500 hover:bg-cyan-600"
                  )}
                >
                  {saved ? (
                    <>
                      <CircleCheck className="h-4 w-4" /> Tersimpan!
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </form>
            </Card>
          )}

          {tab === "keamanan" && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-slate-900">Ganti Kata Sandi</h2>
              <form onSubmit={save} className="mt-4 space-y-4">
                <Field label="Kata sandi lama" name="old-pass" value="" onChange={() => {}} placeholder="••••••••" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kata sandi baru" name="new-pass" value="" onChange={() => {}} placeholder="Min. 8 karakter" />
                  <Field label="Ulangi kata sandi baru" name="confirm-pass" value="" onChange={() => {}} placeholder="••••••••" />
                </div>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-600">
                  {saved ? (
                    <>
                      <CircleCheck className="h-4 w-4" /> Diperbarui!
                    </>
                  ) : (
                    "Perbarui Kata Sandi"
                  )}
                </button>
              </form>
            </Card>
          )}

          {tab === "notifikasi" && (
            <Card className="divide-y divide-line px-6">
              <Toggle
                checked={appNotif}
                onChange={setAppNotif}
                label="Notifikasi aplikasi"
                desc="Pembaruan lamaran, pesan, dan progress latihan di aplikasi."
              />
              <Toggle
                checked={emailNotif}
                onChange={setEmailNotif}
                label="Notifikasi email"
                desc="Pembaruan penting dikirim ke email kamu."
              />
              <Toggle
                checked={digest}
                onChange={setDigest}
                label="Ringkasan mingguan"
                desc="Ringkasan aktivitas karier kamu setiap minggu."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}