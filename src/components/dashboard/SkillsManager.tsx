"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/DataDisplay";
import { addSkillAction, removeSkillAction } from "@/app/jobseeker/actions";
import type { Skill } from "@/types/database";

export function SkillsManager({ mySkills }: { mySkills: Skill[] }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function add(e?: React.FormEvent) {
    e?.preventDefault();
    const name = input.trim();
    if (!name || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await addSkillAction(name);
      if (res.error) setError(res.error);
      else {
        setInput("");
        inputRef.current?.focus();
        router.refresh();
      }
    });
  }

  function remove(skillId: number) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await removeSkillAction(skillId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a skill and press Enter..."
          aria-label="Add a skill"
          maxLength={50}
          disabled={pending}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:outline-2 focus:outline-cyan-500"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="shrink-0 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-600 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          Add
        </button>
      </form>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {mySkills.length === 0 ? (
        <p className="text-sm text-slate-400">No skills added yet.</p>
      ) : (
        <ul className={`flex flex-wrap gap-2 ${pending ? "opacity-60" : ""}`}>
          {mySkills.map((s) => (
            <li key={s.id}>
              <Badge color="bg-cyan-50 text-cyan-700">
                {s.name}
                <button
                  onClick={() => remove(s.id)}
                  disabled={pending}
                  aria-label={`Remove skill ${s.name}`}
                  className="-mr-1 ml-1.5 rounded-full p-0.5 transition-colors hover:bg-cyan-200/60 hover:text-cyan-900 disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
