"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateCompanyStatus } from "@/app/actions/admin";

const ACTIONS: { status: string; label: string; className: string }[] = [
  { status: "approved", label: "Approve", className: "text-emerald-700 hover:underline cursor-pointer" },
  { status: "rejected", label: "Reject", className: "text-amber-700 hover:underline cursor-pointer" },
  { status: "suspended", label: "Suspend", className: "text-red-600 hover:underline cursor-pointer" },
];

export default function AdminCompanyActions({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(status: string) {
    if (busy) return;
    setBusy(status);
    const res = await updateCompanyStatus(companyId, status);
    setBusy(null);
    if ((res as any)?.error) setNotice((res as any).error);
    else {
      setNotice(null);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3">
      {notice && <span className="text-xs text-red-600">{notice}</span>}
      {ACTIONS.map((a) => (
        <button
          key={a.status}
          type="button"
          disabled={busy !== null}
          onClick={() => run(a.status)}
          className={`text-sm font-medium disabled:opacity-50 ${a.className}`}
        >
          {busy === a.status ? "..." : a.label}
        </button>
      ))}
    </div>
  );
}