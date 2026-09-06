import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getEmployeeCalendar } from "@/lib/hrd/services";
import CalendarView from "@/components/hrd/calendar-view";
import EmptyState from "@/components/hrd/empty-state";
import PageHeader from "@/components/hrd/page-header";
import { CalendarClock } from "lucide-react";

export default async function EmployeeCalendarPage() {
  const dashUser = await getDashboardUser();
  const events = getEmployeeCalendar(dashUser.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Calendar" subtitle="Events, meetings, and deadlines you're part of." />
      {events.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nothing scheduled for you"
          description="When HRD schedules an event that includes you, it shows up here on your calendar."
        />
      ) : (
        <CalendarView events={events} />
      )}
    </div>
  );
}