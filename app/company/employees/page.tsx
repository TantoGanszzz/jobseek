import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getEmployees } from "@/lib/hrd/services";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Users } from "lucide-react";

export default async function CompanyEmployeesPage() {
  const dashUser = await getDashboardUser();
  const employees = getEmployees(dashUser.id);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Employees" subtitle="Your hired team members." />

      {employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="When you hire a candidate from an application, they appear here automatically with their skills and contact details."
          action={
            <Link href="/company/applicants" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Review Applicants
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Employee</th>
                  <th className="pb-3 pr-4 font-medium">Position</th>
                  <th className="pb-3 pr-4 font-medium">Department</th>
                  <th className="pb-3 pr-4 font-medium">Contact</th>
                  <th className="pb-3 pr-4 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4">
                      <Link href={`/company/employees/${emp.id}`} className="font-medium text-blue-700 hover:underline">
                        {emp.name}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-medium text-slate-900">{emp.position}</td>
                    <td className="py-4 pr-4 text-slate-700">{emp.department}</td>
                    <td className="py-4 pr-4 text-slate-500">{emp.email ?? "-"}</td>
                    <td className="py-4 pr-4 text-slate-500">{emp.joinedDate}</td>
                    <td className="py-4"><StatusBadge status={emp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}