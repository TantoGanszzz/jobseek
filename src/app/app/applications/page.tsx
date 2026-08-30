import { Badge, Card, MatchBadge, PageHeader } from "@/components/demo/ui";
import { applicationStages, demoApplications, type DemoApplication } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

function StageTimeline({ stage }: { stage: number }) {
  return (
    <div className="flex flex-col gap-0">
      {applicationStages.map((label, i) => {
        const done = i < stage;
        const current = i === stage;
        const past = i > stage;
        return (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4",
                  done && "bg-cyan-500 ring-cyan-100",
                  current && "bg-cyan-600 ring-cyan-200",
                  past && "bg-slate-200 ring-slate-50"
                )}
              />
              {i < applicationStages.length - 1 && (
                <span
                  className={cn(
                    "w-px flex-1",
                    i < stage ? "bg-cyan-400" : "bg-slate-200"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "pb-4 text-sm",
                current
                  ? "font-bold text-cyan-700"
                  : done
                    ? "font-medium text-slate-700"
                    : "text-slate-400"
              )}
            >
              {label}
              {current && (
                <span className="ml-2 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
                  Saat Ini
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ApplicationCard({ app }: { app: DemoApplication }) {
  return (
    <Card className="p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white",
                app.color
              )}
            >
              {app.initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{app.position}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{app.company}</p>
              <p className="mt-1.5 text-xs text-slate-400">{app.appliedAt}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <MatchBadge value={app.match} />
            <Badge tone="success">Lamaran aktif</Badge>
          </div>
        </div>
        <div className="lg:border-l lg:border-line lg:pl-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Status Lamaran
          </p>
          <StageTimeline stage={app.stage} />
        </div>
      </div>
    </Card>
  );
}

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lamaran Saya"
        subtitle="Pantau posisi setiap lamaranmu di sepanjang proses rekrutmen."
      />
      <div className="flex flex-wrap gap-2.5">
        <Badge tone="cyan">Total: {demoApplications.length}</Badge>
        <Badge tone="slate">Diproses: 5</Badge>
        <Badge tone="violet">Interview: 2</Badge>
        <Badge tone="success">Penawaran: 0</Badge>
      </div>
      <div className="space-y-4">
        {demoApplications.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}