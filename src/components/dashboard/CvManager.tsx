"use client";

import { useActionState, useState, useTransition } from "react";
import { Alert, Card, CardBody } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { deleteCvAction, uploadCvAction } from "@/app/jobseeker/actions";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CvManager({ cvPath }: { cvPath: string | null }) {
  const [state, formAction, pending] = useActionState(uploadCvAction, { ok: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, startRemove] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleDownload() {
    // Fetch a fresh signed URL and open it.
    try {
      const res = await fetch(`/jobseeker/cv/url?path=${encodeURIComponent(cvPath!)}`);
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) window.open(json.url, "_blank", "noopener");
    } catch {
      window.location.reload();
    }
  }

  return (
    <div className="space-y-5">
      {state.ok && state.message && <Alert kind="success">{state.message}</Alert>}
      {!state.ok && state.error && <Alert kind="error">{state.error}</Alert>}

      {cvPath ? (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <Icon name="document" className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {cvPath.split("/").pop()}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Uploaded — stored securely &amp; shared only with employers you apply to
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Icon name="download" className="h-4 w-4" />
                Download
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                Remove
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <form action={formAction} className="space-y-3">
          <label
            htmlFor="cv-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center transition-colors hover:border-cyan-400 hover:bg-cyan-50/40"
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
              <Icon name="upload" className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Click to upload your CV
            </span>
            <span className="mt-1 text-xs text-slate-400">
              PDF only, up to 5MB {fileName ? `— selected: ${fileName}` : ""}
            </span>
          </label>
          <input
            id="cv-file"
            name="cv"
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={pending} disabled={!fileName}>
              {pending ? "Uploading..." : "Upload CV"}
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove CV"
        message="This will permanently remove your stored CV. You can upload a new one anytime."
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={() =>
          startRemove(async () => {
            await deleteCvAction();
            setConfirmOpen(false);
          })
        }
      />
    </div>
  );
}

export { formatBytes };
