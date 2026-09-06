"use client";

import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export const textareaCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-900">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  multiple = false,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
}) {
  function toggle(option: string) {
    if (multiple) {
      const next = new Set(value);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      onChange([...next]);
    } else {
      onChange([option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              active
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function SelectInput({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: readonly string[] | string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">{placeholder || "Select an option"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}