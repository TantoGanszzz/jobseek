"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { unsaveJobForCandidate } from "@/app/actions/applications";

export default function RemoveSavedJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    await unsaveJobForCandidate(jobId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleRemove}
      className="border-slate-200 text-red-600 hover:bg-red-50 cursor-pointer"
    >
      {loading ? "Removing..." : "Remove"}
    </Button>
  );
}