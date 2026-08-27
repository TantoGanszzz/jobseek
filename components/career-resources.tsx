import { FileText, MessageSquare, TrendingUp, Map } from "lucide-react";

const resources = [
  {
    icon: FileText,
    title: "Resume Guide",
    description:
      "Panduan lengkap membuat CV yang menarik perhatian recruiter dan ATS-friendly.",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description:
      "Tips dan teknik menghadapi berbagai jenis interview, dari behavioral hingga teknikal.",
  },
  {
    icon: TrendingUp,
    title: "Skill Development",
    description:
      "Rekomendasi skill yang paling dibutuhkan industri dan resource untuk mempelajarinya.",
  },
  {
    icon: Map,
    title: "Career Roadmap",
    description:
      "Jalur karier dari junior hingga senior untuk berbagai bidang teknologi dan bisnis.",
  },
];

export default function CareerResources() {
  return (
    <section className="bg-white py-20 sm:py-28" id="resources">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            Level Up Your Career
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Akses berbagai resource untuk membantu perjalanan karier Anda.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.title}
              className="group p-6 rounded-xl border border-brand-border bg-white hover:shadow-lg hover:border-navy/20 transition-all duration-300 cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-navy/5 border border-brand-border flex items-center justify-center mb-5 group-hover:bg-navy group-hover:border-navy transition-all duration-300">
                <resource.icon className="h-6 w-6 text-navy group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
