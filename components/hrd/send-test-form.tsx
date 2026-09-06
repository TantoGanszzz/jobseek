"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignTestAction } from "@/app/actions/hrd";
import { Send, FileQuestion, Code2 } from "lucide-react";

export default function SendTestForm({ applicantId }: { applicantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"quiz" | "challenge">("quiz");
  const [title, setTitle] = useState("");
  const [minScore, setMinScore] = useState(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await assignTestAction(applicantId, {
      kind,
      title,
      description,
      instructions,
      deadline,
      minScore: String(minScore),
      timeLimitMinutes: String(timeLimitMinutes),
    });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: kind === "challenge" ? "Technical challenge sent to the candidate." : "Qualification test sent to the candidate." });
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="mt-4">
      {!open ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-slate-200 text-slate-700 cursor-pointer"
        >
          <Send className="mr-2 h-4 w-4 text-blue-600" /> Send Assessment
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Send Assessment</h3>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKind("quiz")}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                kind === "quiz"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              <FileQuestion className="h-4 w-4" /> Quiz (auto-scored)
            </button>
            <button
              type="button"
              onClick={() => setKind("challenge")}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                kind === "challenge"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              <Code2 className="h-4 w-4" /> Challenge (manual review)
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {kind === "quiz"
              ? "Questions are built from the job's required skills, and the score is computed server-side from the candidate's self-rated proficiency."
              : "Send a take-home challenge. The candidate submits work (GitHub link, live URL, or written answer) and you review it manually."}
          </p>

          {message && (
            <p className={`rounded-md border px-3 py-2 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {message.text}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "challenge" ? "e.g. Build a job board dashboard" : "Leave empty to use the default"} className="h-10 border-slate-200" />
          </div>

          {kind === "challenge" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What should the candidate build or answer?"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="Submission format, expectations, evaluation criteria..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Deadline</label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-10 border-slate-200" />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Minimum score {minScore} / 100</label>
                <Input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="h-10 border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Time limit (minutes)</label>
                <Input type="number" min={5} max={180} value={timeLimitMinutes} onChange={(e) => setTimeLimitMinutes(Number(e.target.value))} className="h-10 border-slate-200" />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="h-10 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              {loading ? "Sending..." : kind === "challenge" ? "Send Challenge" : "Send Test"}
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