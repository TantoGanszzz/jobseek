"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";

const MAX_CV_MB = 5;

export function ApplyButton({
  jobId,
  hasProfileCv,
  profileCvUrl,
  disabled,
}: {
  jobId: string;
  hasProfileCv: boolean;
  profileCvUrl?: string | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [useProfileCv, setUseProfileCv] = useState(hasProfileCv);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setError(null);

    if (!cvFile && !hasProfileCv) {
      setError("Please attach your CV to apply.");
      return;
    }
    if (cvFile && !/\.pdf$/i.test(cvFile.name)) {
      setError("CV must be a PDF file.");
      return;
    }
    if (cvFile && cvFile.size > MAX_CV_MB * 1024 * 1024) {
      setError(`CV must be smaller than ${MAX_CV_MB}MB.`);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      let cvUrl: string | null = null;

      if (cvFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Session expired. Please log in again.");

        const path = `${user.id}/${Date.now()}-${cvFile.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(path, cvFile, { contentType: "application/pdf" });
        if (uploadError) throw new Error(uploadError.message);

        cvUrl = supabase.storage.from("cvs").getPublicUrl(path).data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          cover_letter: coverLetter.trim() || null,
          cv_url: cvUrl ?? (useProfileCv ? profileCvUrl ?? undefined : undefined),
        });

      if (insertError) {
        if (insertError.message.toLowerCase().includes("duplicate")) {
          throw new Error("You already applied to this job.");
        }
        throw new Error(insertError.message);
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setOpen(false), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)} disabled={disabled}>
        Apply now
      </Button>

      <Modal open={open} onClose={() => !loading && !success && setOpen(false)} title={`Apply for this position`}>
        {success ? (
          <Alert kind="success">Application submitted! Track it in My Applications.</Alert>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Your profile will be sent along with this application.
            </p>
            {error && <Alert kind="error">{error}</Alert>}

            <Textarea
              label="Cover letter"
              name="cover_letter"
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
            />

            {hasProfileCv && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={useProfileCv}
                  onChange={(e) => setUseProfileCv(e.target.checked)}
                  disabled={!!cvFile}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Use the CV from my profile
              </label>
            )}

            <div className="space-y-1.5">
              <label htmlFor="apply-cv" className="block text-sm font-medium text-slate-700">
                Attach CV {!hasProfileCv && <span className="text-cyan-600">*</span>}
              </label>
              <input
                id="apply-cv"
                type="file"
                accept=".pdf"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-lg border border-dashed border-slate-300 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cyan-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cyan-700 hover:file:bg-cyan-100"
              />
              {cvFile && (
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                >
                  Remove selected: {cvFile.name}
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleApply} loading={loading}>
                Submit application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
