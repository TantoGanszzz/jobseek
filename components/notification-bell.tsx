"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import type { AppNotification } from "@/lib/hrd/types";
import { markNotificationsReadAction } from "@/app/actions/applications";

function formatTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  async function handleMarkRead() {
    if (unread === 0) return;
    setMarking(true);
    await markNotificationsReadAction();
    setMarking(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
        aria-label={`Notifications (${unread} unread)`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-80 max-w-[80vw] rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <button
                type="button"
                onClick={handleMarkRead}
                disabled={marking || unread === 0}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer disabled:text-slate-300 disabled:cursor-default"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {marking ? "Marking..." : "Mark all read"}
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</p>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start gap-2 px-4 py-3 border-b border-slate-50 last:border-0 ${
                        n.read ? "" : "bg-blue-50/50"
                      }`}
                    >
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-slate-200" : "bg-blue-600"}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700">{n.text}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{formatTime(n.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}