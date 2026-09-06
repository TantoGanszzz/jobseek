"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent, EventType } from "@/lib/hrd/types";

const TYPE_STYLES: Record<EventType, string> = {
  interview: "bg-blue-50 text-blue-700",
  meeting: "bg-violet-50 text-violet-700",
  deadline: "bg-red-50 text-red-700",
  event: "bg-amber-50 text-amber-700",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<number | null> = [];
    for (let i = 0; i < startWeekday; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(d);
    return list;
  }, [year, month]);

  function shift(amount: number) {
    const d = new Date(year, month + amount, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const iso = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => shift(-1)} className="cursor-pointer border-slate-200 text-slate-600">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} className="cursor-pointer border-slate-200 text-slate-600">
            Today
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => shift(1)} className="cursor-pointer border-slate-200 text-slate-600">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center text-xs font-medium text-slate-500">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} className="min-h-24 border-b border-r border-slate-100 bg-slate-50/50 p-1" />;
          const dayEvents = eventsByDate.get(iso(day)) ?? [];
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={iso(day)} className="min-h-24 border-b border-r border-slate-100 p-1">
              <div className={cn("mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", isToday ? "bg-blue-600 text-white" : "text-slate-700")}>
                {day}
              </div>
              <div className="space-y-1">
                {dayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    className={cn("block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium", TYPE_STYLES[ev.type] ?? TYPE_STYLES.event)}
                    title={`${ev.title}${ev.time ? ` · ${ev.time}` : ""}${ev.participants.length ? ` · ${ev.participants.join(", ")}` : ""}`}
                  >
                    {ev.time ? `${ev.time} ` : ""}{ev.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}