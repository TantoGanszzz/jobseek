"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, CheckCheck, CircleAlert, Clock, FileCheck, Info, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/demo/ui";
import { demoNotifications } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

const toneIcon = {
  cyan: <Users className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />,
  success: <FileCheck className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />,
  warning: <CircleAlert className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />,
  info: <Info className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />,
};

const toneColor = {
  cyan: "bg-cyan-50 text-cyan-600",
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-slate-100 text-slate-500",
} as const;

export default function NotificationsPage() {
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [read, setRead] = useState<Set<string>>(
    () => new Set(demoNotifications.filter((n) => n.read).map((n) => n.id))
  );

  const list = demoNotifications.filter((n) => (onlyUnread ? !read.has(n.id) : true));

  function markAll() {
    setRead(new Set(demoNotifications.map((n) => n.id)));
  }

  const unreadCount = demoNotifications.filter((n) => !read.has(n.id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        subtitle="Pembaruan lamaran, interview, dan perkembangan kariermu."
        actions={
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai Semua Dibaca
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={unreadCount ? "cyan" : "slate"}>
          {unreadCount} belum dibaca
        </Badge>
        <button
          type="button"
          onClick={() => setOnlyUnread((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
            onlyUnread
              ? "bg-cyan-500 text-white"
              : "border border-line bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-600"
          )}
        >
          <BellRing className="h-3.5 w-3.5" />
          Belum dibaca saja
        </button>
      </div>

      <div className="space-y-3">
        {list.map((n) => {
          const isRead = read.has(n.id);
          return (
            <Card
              key={n.id}
              className={cn(
                "flex items-start gap-4 p-5",
                !isRead && "border-cyan-200 bg-cyan-50/40"
              )}
            >
              <span className={cn("mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneColor[n.tone])}>
                {toneIcon[n.tone]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  {!isRead && <Badge tone="cyan">Baru</Badge>}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{n.text}</p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {n.time}
                </p>
              </div>
              {!isRead && (
                <button
                  type="button"
                  onClick={() => setRead((prev) => new Set(prev).add(n.id))}
                  className="shrink-0 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-cyan-300 hover:text-cyan-600"
                >
                  Tandai dibaca
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        Kelola preferensi notifikasi di{" "}
        <Link href="/app/settings" className="font-semibold text-cyan-600 hover:underline">
          Pengaturan
        </Link>
        .
      </p>
    </div>
  );
}