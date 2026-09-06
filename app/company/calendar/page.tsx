import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getCalendar } from "@/lib/hrd/services";
import CalendarView from "@/components/hrd/calendar-view";
import CreateEventForm from "@/components/hrd/create-event-form";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { CalendarClock } from "lucide-react";

export default async function CompanyCalendarPage() {
  const dashUser = await getDashboardUser();
  const events = getCalendar(dashUser.id);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Calendar" subtitle="Schedule interviews, meetings, and deadlines." />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_360px]">
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Your calendar is empty"
            description="Schedule interviews, meetings, and deadlines to keep your team on track."
          />
        ) : (
          <CalendarView events={events} />
        )}

        <aside className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Schedule Event</h2>
          <CreateEventForm />
        </aside>
      </div>
    </div>
  );
}