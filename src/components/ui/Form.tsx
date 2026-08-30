import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

function FieldWrapper({
  label,
  error,
  hint,
  required,
  htmlFor,
  children,
}: FieldProps & { htmlFor?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-cyan-600"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-2 focus:outline-offset-0 focus:outline-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-50";

export function Input({
  label,
  error,
  hint,
  required,
  className,
  id,
  ...props
}: FieldProps & ComponentProps<"input">) {
  const inputId = id ?? props.name;
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        aria-invalid={!!error || undefined}
        className={cn(
          controlBase,
          error ? "border-red-300 focus:outline-red-500" : "border-slate-300",
          className
        )}
        {...props}
      />
    </FieldWrapper>
  );
}

export function Textarea({
  label,
  error,
  hint,
  required,
  className,
  id,
  rows = 4,
  ...props
}: FieldProps & ComponentProps<"textarea">) {
  const inputId = id ?? props.name;
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      htmlFor={inputId}
    >
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={!!error || undefined}
        className={cn(
          controlBase,
          "resize-y",
          error ? "border-red-300 focus:outline-red-500" : "border-slate-300",
          className
        )}
        {...props}
      />
    </FieldWrapper>
  );
}

export function Select({
  label,
  error,
  hint,
  required,
  className,
  id,
  children,
  ...props
}: FieldProps & ComponentProps<"select">) {
  const inputId = id ?? props.name;
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      htmlFor={inputId}
    >
      <select
        id={inputId}
        aria-invalid={!!error || undefined}
        className={cn(
          controlBase,
          "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-no-repeat pr-9",
          error ? "border-red-300 focus:outline-red-500" : "border-slate-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
