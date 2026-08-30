"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import { EMPLOYMENT_TYPES } from "@/types/database";
import { Icon } from "@/components/ui/Icon";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [employmentType, setEmploymentType] = useState(
    searchParams.get("type") ?? ""
  );
  const [salaryMin, setSalaryMin] = useState(searchParams.get("salary") ?? "");

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (location.trim()) params.set("location", location.trim());
    if (employmentType) params.set("type", employmentType);
    if (salaryMin && !Number.isNaN(Number(salaryMin)))
      params.set("salary", salaryMin);
    startTransition(() => {
      router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
    });
  }

  function resetFilters() {
    setSearch("");
    setLocation("");
    setEmploymentType("");
    setSalaryMin("");
    startTransition(() => router.push("/jobs"));
  }

  return (
    <form
      onSubmit={applyFilters}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label="Job search filters"
    >
      <div>
        <label htmlFor="filter-search" className="mb-1.5 block text-sm font-medium text-slate-700">
          Keyword
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            id="filter-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title or keyword"
            className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-9 text-sm placeholder:text-slate-400 focus:outline-2 focus:outline-cyan-500"
          />
        </div>
      </div>

      <Input
        label="Location"
        name="location"
        placeholder="e.g. Jakarta or Remote"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <Select
        label="Employment type"
        name="employment_type"
        value={employmentType}
        onChange={(e) => setEmploymentType(e.target.value)}
      >
        <option value="">All types</option>
        {EMPLOYMENT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <Input
        label="Minimum salary"
        name="salary_min"
        type="number"
        min={0}
        step={1000}
        placeholder="e.g. 50000"
        value={salaryMin}
        onChange={(e) => setSalaryMin(e.target.value)}
      />

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" loading={pending} disabled={pending}>
          Apply filters
        </Button>
        <Button type="button" variant="ghost" onClick={resetFilters} disabled={pending}>
          Reset
        </Button>
      </div>
    </form>
  );
}
