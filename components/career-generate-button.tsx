"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateCareerRecommendations } from "@/app/actions/career";

export default function CareerGenerateButton({
  label = "Generate Career Recommendations",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await generateCareerRecommendations();
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage("Recommendations generated from your profile.");
        router.refresh();
      }
    } catch {
      setMessage("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 px-6 text-white hover:bg-blue-700"
      >
        {loading ? "Analyzing your profile..." : label}
      </Button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}