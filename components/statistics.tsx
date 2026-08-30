import { Briefcase, Building2, Users, BookOpen } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    value: "10K+",
    label: "Job Opportunities",
  },
  {
    icon: Building2,
    value: "5K+",
    label: "Companies",
  },
  {
    icon: Users,
    value: "25K+",
    label: "Career Seekers",
  },
  {
    icon: BookOpen,
    value: "100+",
    label: "Career Resources",
  },
];

export default function Statistics() {
  return (
    <section className="bg-navy py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center group"
            >
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
