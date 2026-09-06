"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  label: string;
  category: string;
}

interface Props {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  error?: string;
  helpText?: string;
  categories?: Record<string, CategoryOption[]>;
  searchable?: boolean;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  min,
  max,
  placeholder,
  error,
  helpText,
  categories,
  searchable = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");

  const selected = new Set(value);

  const filteredOptions = useMemo(() => {
    if (!searchable && !categories) return options;
    const q = query.trim().toLowerCase();
    let list = options;
    if (categories && activeCategory) {
      const inCat = new Set(categories[activeCategory]?.map((o) => o.label) || []);
      list = list.filter((o) => inCat.has(o));
    }
    if (searchable && q) {
      list = list.filter((o) => o.toLowerCase().includes(q));
    }
    return list;
  }, [options, query, searchable, categories, activeCategory]);

  function toggle(option: string) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else {
      if (max != null && next.size >= max) return;
      next.add(option);
    }
    onChange([...next]);
  }

  const categoryNames = categories ? Object.keys(categories) : [];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-900">{label}</label>
        {max != null && (
          <span className="text-xs text-slate-500">
            {value.length} / {max}
          </span>
        )}
      </div>

      {categories && categoryNames.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium cursor-pointer",
              activeCategory === "" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All
          </button>
          {categoryNames.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium cursor-pointer",
                activeCategory === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {searchable && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

      {filteredOptions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
          No options found.
        </p>
      ) : (
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
          {filteredOptions.map((option) => {
            const isSelected = selected.has(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                aria-label={`Remove ${v}`}
                className="rounded-full p-0.5 hover:bg-blue-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {helpText && !error && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}