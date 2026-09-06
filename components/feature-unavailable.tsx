import Link from "next/link";

export default function FeatureUnavailable({
  title = "Fitur Belum Tersedia",
  backHref,
  backLabel = "Kembali",
}: {
  title?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Fitur ini belum didukung oleh database aplikasi saat ini.
      </p>
      {backHref && <Link href={backHref} className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline">{backLabel}</Link>}
    </div>
  );
}
