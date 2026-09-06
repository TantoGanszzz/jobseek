"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAnnouncementAction } from "@/app/actions/hrd";
import { Megaphone } from "lucide-react";

const AUDIENCES = ["All Employees", "Engineering", "Design", "Marketing", "Operations"];

export default function CreateAnnouncementForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Employees");
  const [publishDate, setPublishDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createAnnouncementAction({ title, message, audience, publishDate });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setTitle("");
      setMessage("");
      setPublishDate("");
      router.refresh();
      onCreated?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="ann-title" className="text-sm font-medium text-slate-700">Title *</label>
        <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Public holiday notice" className="h-10 border-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ann-audience" className="text-sm font-medium text-slate-700">Audience</label>
          <select
            id="ann-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ann-date" className="text-sm font-medium text-slate-700">Publish Date</label>
          <Input id="ann-date" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="h-10 border-slate-200" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ann-message" className="text-sm font-medium text-slate-700">Message *</label>
        <textarea
          id="ann-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={3}
          placeholder="Write the announcement..."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Button type="submit" disabled={loading} className="h-10 cursor-pointer bg-blue-600 px-5 text-white hover:bg-blue-700">
        <Megaphone className="mr-2 h-4 w-4" />
        {loading ? "Publishing..." : "Publish Announcement"}
      </Button>
    </form>
  );
}