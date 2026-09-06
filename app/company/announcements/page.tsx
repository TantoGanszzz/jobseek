import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getAnnouncements } from "@/lib/hrd/services";
import CreateAnnouncementForm from "@/components/hrd/create-announcement-form";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { Megaphone } from "lucide-react";

export default async function CompanyAnnouncementsPage() {
  const dashUser = await getDashboardUser();
  const announcements = getAnnouncements(dashUser.id);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Announcements" subtitle="Keep employees informed about company news." />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="Publish company news, policy updates, and event notices for your team."
            />
          ) : (
            announcements.map((ann) => (
              <article key={ann.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{ann.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {ann.audience === "all" ? "All Employees" : ann.audience} · {ann.publishDate}
                    </p>
                  </div>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {ann.audience}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{ann.message}</p>
              </article>
            ))
          )}
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">New Announcement</h2>
          <CreateAnnouncementForm />
        </aside>
      </div>
    </div>
  );
}