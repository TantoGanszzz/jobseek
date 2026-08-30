import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter, Briefcase, Clock, DollarSign, Wifi } from "lucide-react";

interface JobSearchProps {
  isLoggedIn?: boolean;
}

export default function JobSearch({}: JobSearchProps) {
  return (
    <section className="bg-white py-20 sm:py-28" id="find-jobs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            Find Your Next Opportunity
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Cari pekerjaan berdasarkan skill, lokasi, dan preferensi Anda.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-light-bg rounded-2xl border border-brand-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, skills, or companies"
                className="pl-10 h-12 bg-white border-brand-border focus:border-navy rounded-xl"
              />
            </div>
            <div className="relative flex-1 sm:max-w-[220px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="pl-10 h-12 bg-white border-brand-border focus:border-navy rounded-xl"
              />
            </div>
            <Button
              size="lg"
              className="bg-navy text-white hover:bg-navy-light font-medium h-12 px-8 rounded-xl cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4" />
              Search Jobs
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {[
              { icon: Briefcase, label: "Job Type" },
              { icon: Clock, label: "Experience" },
              { icon: MapPin, label: "Location" },
              { icon: Wifi, label: "Remote" },
              { icon: DollarSign, label: "Salary" },
            ].map((filter) => (
              <button
                key={filter.label}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-navy/70 bg-white border border-brand-border rounded-full hover:border-navy/30 hover:text-navy transition-colors cursor-pointer"
              >
                <filter.icon className="h-3.5 w-3.5" />
                {filter.label}
                <Filter className="h-3 w-3 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
