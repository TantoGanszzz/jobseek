"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reviewTestAction } from "@/app/actions/hrd";
import { ClipboardCheck } from "lucide-react";
import type { TestAssignment } from "@/lib/hrd/types";

export default function ReviewChallengeForm({
  assignment,
  jobTitle,
}: {
  assignment: TestAssignment;
  jobTitle?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(70);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState<"pass" | "fail">("pass");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await reviewTestAction(assignment.id, {
      score: String(score),
      feedback,
      decision,
    });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Review saved. The candidate has been notified." });
      setOpen(false);
      router.refresh();
    }
  }

  const submission = assignment.submission;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-amber-600" />
        <h4 className="text-sm font-semibold text-amber-800">Awaiting review</h4>
      </div>
      <p className="mt-1 text-xs text-amber-700">
        {jobTitle ? `The candidate submitted the challenge for "${jobTitle}".` : "The candidate submitted work for this challenge."}
      </p>

      {submission ? (
        <div className="mt-3 space-y-1 text-xs text-slate-700">
          {submission.gitHubUrl && (
            <p><span className="font-medium">GitHub:</span> <a href={submission.gitHubUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">{submission.gitHubUrl}</a></p>
          )}
          {submission.liveDemoUrl && (
            <p><span className="font-medium">Live demo:</span> <a href={submission.liveDemoUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">{submission.liveDemoUrl}</a></p>
          )}
          {submission.textAnswer && (
            <p className="whitespace-pre-line"><span className="font-medium">Answer:</span> {submission.textAnswer}</p>
          )}
          {submission.notes && (
            <p className="whitespace-pre-line"><span className="font-medium">Notes:</span> {submission.notes}</p>
          )}
          {submission.submittedAt && (
            <p><span className="font-medium">Submitted:</span> {new Date(submission.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">No submission payload recorded.</p>
      )}

      {!open ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="mt-3 h-10 border-amber-300 bg-white text-amber-700 hover:bg-amber-100 cursor-pointer"
        >
          Review submission
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-amber-200 bg-white p-3">
          {message && (
            <p className={`rounded-md border px-3 py-2 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {message.text}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Score (0–100)</label>
            <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} className="h-10 border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Feedback (shown to the candidate)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="What stood out, what to improve..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDecision("pass")}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                decision === "pass"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              }`}
            >
              Pass — move to interview
            </button>
            <button
              type="button"
              onClick={() => setDecision("fail")}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                decision === "fail"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-300"
              }`}
            >
              Fail — reject
            </button>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="h-10 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              {loading ? "Saving..." : "Save Review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-10 border-slate-200 text-slate-700 cursor-pointer">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
