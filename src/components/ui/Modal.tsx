"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-cyan-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  destructive?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          disabled={loading}
          className="h-9 rounded-lg border border-slate-300 px-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-cyan-600"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          autoFocus
          className={cn(
            "h-9 rounded-lg px-3.5 text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600",
            destructive ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600"
          )}
        >
          {loading ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
