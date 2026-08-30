import { JobsExplorer } from "@/components/demo/JobsExplorer";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <JobsExplorer initialQuery={q ?? ""} />;
}