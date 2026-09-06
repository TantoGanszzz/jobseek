"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEventAction } from "@/app/actions/hrd";
import { CalendarClock, Plus, X } from "lucide-react";

const EVENT_TYPES = ["interview", "meeting", "deadline", "event"] as const;

export default function CreateEventForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<(typeof EVENT_TYPES)[number]>("meeting");
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function addParticipant() {
    const trimmed = participantInput.trim();
    if (trimmed && !participants.includes(trimmed)) {
      setParticipants([...participants, trimmed]);
      setParticipantInput("");
    }
  }

  function removeParticipant(name: string) {
    setParticipants(participants.filter((p) => p !== name));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createEventAction({ title, date, time, participants, type });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Event scheduled!" });
      setTitle("");
      setDate("");
      setTime("");
      setParticipants([]);
      router.refresh();
      onCreated?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`rounded-lg border p-3 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="event-title" className="text-sm font-medium text-slate-700">Title *</label>
        <Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Candidate interview" className="h-10 border-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="event-date" className="text-sm font-medium text-slate-700">Date *</label>
          <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-10 border-slate-200" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="event-time" className="text-sm font-medium text-slate-700">Time</label>
          <Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 border-slate-200" />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Type</span>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                type === t
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Participants</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {participants.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
              {p}
              <button type="button" onClick={() => removeParticipant(p)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addParticipant();
              }
            }}
            placeholder="Add participant (name or email)"
            className="h-10 border-slate-200"
          />
          <Button type="button" variant="outline" onClick={addParticipant} className="h-10 cursor-pointer border-slate-200 text-slate-700">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {participants.length === 0 && (
          <p className="text-xs text-slate-400">You alone — no other participants yet.</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="h-10 cursor-pointer bg-blue-600 px-5 text-white hover:bg-blue-700">
        <CalendarClock className="mr-2 h-4 w-4" />
        {loading ? "Scheduling..." : "Schedule Event"}
      </Button>
    </form>
  );
}