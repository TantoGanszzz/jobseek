"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { submitTestResult } from "@/app/actions/applications";
import type { TestQuestion } from "@/lib/hrd/types";

export default function TestAssignmentClient({
  assignmentId,
  title,
  jobTitle,
  companyName,
  questions,
  minScore,
  timeLimitMinutes,
}: {
  assignmentId: string;
  title: string;
  jobTitle: string;
  companyName: string;
  questions: TestQuestion[];
  minScore: number;
  timeLimitMinutes: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(qi: number, oi: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  }

  async function handleSubmit() {
    if (answers.some((a) => a < 0)) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitTestResult(assignmentId, answers);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {jobTitle} · {companyName}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {questions.length} questions · {timeLimitMinutes} minute limit · minimum {minScore} / 100
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {qi + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((option, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                      answers[qi] === oi
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => handleSelect(qi, oi)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </div>
  );
}