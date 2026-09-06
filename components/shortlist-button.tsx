"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateApplicationStatus } from "@/app/actions/company-applications";
import { CheckCheck, X } from "lucide-react";

export default function ShortlistButton({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate(status: string) {
    setLoading(true);
    setMessage(null);
    const result = await updateApplicationStatus(applicationId, status);
    setLoading(false);
    if (result?.error) {
      setMessage(result.error);
    } else {
      if (status === "shortlisted") setMessage("Candidate shortlisted.");
      if (status === "rejected") setMessage("Candidate rejected.");
      router.refresh();
    }
  }

  const isShortlisted = currentStatus === "shortlisted";
  const isRejected = currentStatus === "rejected";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        onClick={() => handleUpdate("shortlisted")}
        disabled={loading || isShortlisted}
        className={`${isShortlisted ? "bg-blue-100 text-blue-700 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"} cursor-pointer`}
      >
        <CheckCheck className="mr-2 h-4 w-4" />
        {isShortlisted ? "Shortlisted" : "Shortlist"}
      </Button>
      <Button
        onClick={() => handleUpdate("rejected")}
        disabled={loading || isRejected}
        className="border border-slate-200 text-red-600 hover:bg-red-50 cursor-pointer"
      >
        <X className="mr-2 h-4 w-4" />
        Reject
      </Button>
      {message && <span className="text-sm text-slate-600">{message}</span>}
    </div>
  );
}