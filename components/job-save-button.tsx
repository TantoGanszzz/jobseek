"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveJobForCandidate, unsaveJobForCandidate } from "@/app/actions/applications";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function SaveButton({
  jobId,
  initialSaved,
  asButton = false,
}: {
  jobId: string;
  initialSaved: boolean;
  asButton?: boolean;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      if (isSaved) {
        await unsaveJobForCandidate(jobId);
        setIsSaved(false);
      } else {
        await saveJobForCandidate(jobId);
        setIsSaved(true);
      }
      router.refresh();
    } catch {
      setIsSaved(!isSaved);
    }
    setLoading(false);
  }

  if (asButton) {
    return (
      <Button
        variant="outline"
        disabled={loading}
        onClick={handleSave}
        className="w-full sm:w-auto border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 cursor-pointer"
      >
        {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4 text-blue-600" /> : <Bookmark className="mr-2 h-4 w-4" />}
        {isSaved ? "Saved" : "Save Job"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={loading}
      className={`p-2 rounded-lg transition-all cursor-pointer ${
        isSaved ? "text-blue-700 bg-blue-50" : "text-slate-400 hover:text-blue-700 hover:bg-blue-50"
      }`}
      aria-label={isSaved ? "Remove from saved" : "Save job"}
    >
      {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
    </button>
  );
}