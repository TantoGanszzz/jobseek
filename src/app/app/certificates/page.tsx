import { Award, BadgeCheck, FileText, Link2 } from "lucide-react";
import { Badge, Card, PageHeader, SectionHeader } from "@/components/demo/ui";
import { demoCertificates } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sertifikat"
        subtitle="Bukti resmi atas skill dan pelatihan yang sudah kamu selesaikan."
        actions={<Badge tone="cyan">{demoCertificates.length} sertifikat</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {demoCertificates.map((c) => (
          <Card key={c.id} className="overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-white/70 text-white",
                  c.color
                )}
              >
                <Award className="h-6 w-6" />
              </span>
              <Badge tone="success">
                <BadgeCheck className="h-3.5 w-3.5" />
                Terverifikasi
              </Badge>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{c.title}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{c.issuer}</p>
            <p className="mt-1 text-xs text-slate-400">Diterbitkan {c.date}</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600">
                <FileText className="h-3.5 w-3.5" />
                Lihat
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600">
                <Link2 className="h-3.5 w-3.5" />
                Salin Link
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <SectionHeader title="Cara mendapatkan sertifikat" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: "01", text: "Selesaikan seluruh materi latihan dengan minimal skor 80%" },
            { step: "02", text: "Kerjakan assessment akhir dari setiap materi" },
            { step: "03", text: "Sertifikat otomatis terbit dan bisa ditautkan di profil" },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-line bg-slate-50 p-4">
              <span className="text-sm font-extrabold text-cyan-600">{s.step}</span>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}