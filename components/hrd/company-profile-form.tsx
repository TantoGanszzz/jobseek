"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCompanyProfileAction } from "@/app/actions/hrd";
import { Save } from "lucide-react";
import type { CompanyProfile } from "@/lib/hrd/types";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Media & Communications",
  "Consulting",
  "Other",
];

const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function CompanyProfileForm({ initial }: { initial: CompanyProfile | null }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [companySize, setCompanySize] = useState(initial?.companySize ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await saveCompanyProfileAction({
      name,
      industry,
      companySize,
      location,
      website,
      description,
    });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Company profile saved." });
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`rounded-lg border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Company Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="cp-name" className="text-sm font-medium text-slate-700">Company Name *</label>
            <Input id="cp-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. PT Nusantara Digital" className="h-11 border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="cp-industry" className="text-sm font-medium text-slate-700">Industry</label>
            <select
              id="cp-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="cp-location" className="text-sm font-medium text-slate-700">Location</label>
            <Input id="cp-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Jakarta, Indonesia" className="h-11 border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="cp-website" className="text-sm font-medium text-slate-700">Website</label>
            <Input id="cp-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="h-11 border-slate-200" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Company Size</span>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCompanySize(s)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  companySize === s
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cp-description" className="text-sm font-medium text-slate-700">About the Company</label>
          <textarea
            id="cp-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Short description of the company..."
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="h-11 cursor-pointer bg-blue-600 px-6 text-white hover:bg-blue-700">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Saving..." : "Save Company Profile"}
      </Button>
    </form>
  );
}