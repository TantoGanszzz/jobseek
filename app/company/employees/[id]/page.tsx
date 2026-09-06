import Link from "next/link";
import { notFound } from "next/navigation";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getEmployeeDetail } from "@/lib/hrd/services";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/hrd/priority-badge";
import EmptyState from "@/components/hrd/empty-state";
import { ArrowLeft, Briefcase, MapPin, Mail, Phone, UserCircle } from "lucide-react";

export default async function CompanyEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashUser = await getDashboardUser();
  const { employee, assignedTasks } = getEmployeeDetail(id, dashUser.id);

  if (!employee) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <Link href="/company/employees" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Back to employees
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {employee.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{employee.name}</h1>
              <StatusBadge status={employee.status} />
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <Briefcase className="h-4 w-4 text-blue-600" /> {employee.position} · {employee.department}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-blue-600" /> {employee.location ?? "No location"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <Mail className="h-4 w-4 text-blue-600" /> {employee.email ?? "No email"}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-blue-600" /> {employee.phone ?? "No phone"}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <UserCircle className="h-4 w-4 text-blue-600" /> Joined {employee.joinedDate}
          </div>
        </div>

        {employee.skills.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {employee.skills.map((s) => (
                <span key={s} className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Assigned Tasks ({assignedTasks?.length ?? 0})</h2>
        {(assignedTasks?.length ?? 0) === 0 ? (
          <EmptyState
            className="mt-4"
            title="No tasks assigned"
            description="This employee has no assigned tasks yet. Assign a task to get them started."
          />
        ) : (
          <div className="mt-4 space-y-2">
            {assignedTasks?.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">{task.title}</div>
                  {task.projectName && <div className="text-xs text-slate-500">{task.projectName}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}