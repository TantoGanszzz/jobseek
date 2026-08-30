import { Card, CardBody, CardHeader } from "@/components/ui/DataDisplay";
import { JobForm } from "@/components/hrd/JobForm";

export const metadata = { title: "New Job" };

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Job</h1>
        <p className="mt-1 text-sm text-slate-500">
          Post a new opening. You can save it as a draft or publish it right away.
        </p>
      </section>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader title="Job details" />
        <CardBody>
          <JobForm />
        </CardBody>
      </Card>
    </div>
  );
}
