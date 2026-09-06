"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

export default function StepProgress({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) {
  const totalSteps = steps.length;
  const pct = Math.round(((current) / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">
          Step {current} of {totalSteps}: {steps[current - 1]?.label}
        </p>
        <div className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Horizontal stepper */}
      <ol className="hidden flex-wrap items-center gap-1 md:flex">
        {steps.map((step, i) => {
          const num = i + 1;
          const isCurrent = num === current;
          const isDone = num < current;
          return (
            <li key={step.label} className="flex items-center">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  isDone && "bg-blue-50 text-blue-700",
                  isCurrent && "bg-blue-600 text-white",
                  !isDone && !isCurrent && "bg-slate-100 text-slate-500"
                )}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
                    {num}
                  </span>
                )}
                <span className="whitespace-nowrap">{step.label}</span>
              </span>
              {num < totalSteps && <span className="mx-1 h-px w-2 bg-slate-300" />}
            </li>
          );
        })}
      </ol>

      {/* Mobile dots */}
      <div className="flex items-center justify-center gap-1.5 md:hidden">
        {steps.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full",
              i + 1 === current ? "bg-blue-600 w-5" : i + 1 < current ? "bg-blue-300" : "bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}