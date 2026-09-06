"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scheduleInterviewAction } from "@/app/actions/hrd";
import { CalendarPlus } from "lucide-react";

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

export default function ScheduleInterviewForm({ applicantId }: { applicantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await scheduleInterviewAction(applicantId, {
      title,
      date,
      time,
      location,
      durationMinutes: String(durationMinutes),
      notes,
    });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Interview scheduled and added to the calendar." });
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="mt-6">
      {!open ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-slate-200 text-slate-700 cursor-pointer"
        >
          <CalendarPlus className="mr-2 h-4 w-4 text-blue-600" /> Schedule Interview
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Schedule Interview</h3>
          {message && (
            <p className={`rounded-md border px-3 py-2 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {message.text}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Technical Interview" className="h-10 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Date *</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-10 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationMinutes(d)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      durationMinutes === d
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Google Meet / Office" className="h-10 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agenda, interviewer names..." className="h-10 border-slate-200" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="h-10 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              {loading ? "Scheduling..." : "Schedule"}
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