"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Globe, FileText, StickyNote } from "lucide-react";
import { submitChallenge } from "@/app/actions/applications";

export default function TestSubmissionClient({
  assignmentId,
  deadline,
}: {
  assignmentId: string;
  deadline: string | null;
}) {
  const router = useRouter();
  const [gitHubUrl, setGitHubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gitHubUrl.trim() && !liveDemoUrl.trim() && !textAnswer.trim()) {
      setError("Submit at least a GitHub URL, a live demo URL, or a text answer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitChallenge(assignmentId, {
      gitHubUrl,
      liveDemoUrl,
      textAnswer,
      notes,
    });
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="github_url" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Link2 className="h-4 w-4 text-slate-400" /> GitHub / Repository URL
        </label>
        <Input
          id="github_url"
          value={gitHubUrl}
          onChange={(e) => setGitHubUrl(e.target.value)}
          placeholder="https://github.com/yourname/project"
          className="h-11 border-slate-200"
        />
      </div>

      <div>
        <label htmlFor="live_demo_url" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Globe className="h-4 w-4 text-slate-400" /> Live Demo URL
        </label>
        <Input
          id="live_demo_url"
          value={liveDemoUrl}
          onChange={(e) => setLiveDemoUrl(e.target.value)}
          placeholder="https://your-demo.vercel.app"
          className="h-11 border-slate-200"
        />
      </div>

      <div>
        <label htmlFor="text_answer" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <FileText className="h-4 w-4 text-slate-400" /> Text answer (optional)
        </label>
        <textarea
          id="text_answer"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          rows={4}
          placeholder="Explain your approach, the tools you used, and the result."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="submission_notes" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <StickyNote className="h-4 w-4 text-slate-400" /> Additional notes (optional)
        </label>
        <textarea
          id="submission_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the reviewer should know."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {deadline && (
        <p className="text-xs text-slate-500">
          Submission deadline: {new Date(deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. You cannot edit your submission after the deadline.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
        {submitting ? "Submitting..." : "Submit Challenge"}
      </Button>
    </form>
  );
}