"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { applyToJob } from "@/app/actions/jobs";

export default function ApplyButton({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    const result = await applyToJob(jobId);
    setLoading(false);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.push("/dashboard/applications");
  }

  return (
    <Button
      className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
      disabled={loading}
      onClick={handleApply}
    >
      {loading ? "Applying..." : `Apply to ${jobTitle}`}
    </Button>
  );
}
