import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-bg border border-brand-border text-xs font-medium text-navy">
                <Star className="h-3.5 w-3.5" />
                Platform Karier #1 untuk Fresh Graduate
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight leading-[1.1]">
                Build Your Career.{" "}
                <span className="relative">
                  Find Your Future.
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8C50 2 150 2 298 8"
                      stroke="#0B1F3A"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.2"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Temukan pekerjaan impian, kembangkan skill, dan persiapkan
                karier Anda bersama ribuan perusahaan terpercaya di Indonesia.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/find-jobs">
                <Button
                  size="lg"
                  className="bg-navy text-white hover:bg-navy-light font-medium h-12 px-8 text-base cursor-pointer"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find Jobs
                </Button>
              </Link>
              <Link href="#resources">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-navy text-navy hover:bg-navy/5 font-medium h-12 px-8 text-base cursor-pointer"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Explore Careers
                </Button>
              </Link>
            </div>

            {/* Mini Stats */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-navy/10 border-2 border-white flex items-center justify-center"
                    >
                      <Users className="h-3.5 w-3.5 text-navy/60" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-navy">25K+</strong> pencari kerja
                </span>
              </div>
            </div>
          </div>

          {/* Right Column — Visual Elements */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[480px]">
              {/* Decorative background */}
              <div className="absolute inset-0 rounded-3xl bg-light-bg border border-brand-border" />

              {/* Floating Job Cards */}
              <div
                className="float-animation absolute top-8 left-8 bg-white rounded-xl border border-brand-border shadow-sm p-4 w-64"
                style={{
                  animationName: "float",
                  animationDuration: "4s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Frontend Developer
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      TechNova • Jakarta
                    </p>
                    <div className="flex gap-1 mt-2">
                      <span className="px-2 py-0.5 text-[10px] bg-light-bg text-navy rounded-full border border-brand-border">
                        React
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-light-bg text-navy rounded-full border border-brand-border">
                        Next.js
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="float-animation absolute top-36 right-6 bg-white rounded-xl border border-brand-border shadow-sm p-4 w-56"
                style={{
                  animationName: "float",
                  animationDuration: "4s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: "1s",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      UI/UX Designer
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PixelCraft • Remote
                    </p>
                    <div className="mt-2 text-xs text-navy font-medium">
                      Rp 7 - 12 Juta
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="float-animation absolute bottom-24 left-12 bg-white rounded-xl border border-brand-border shadow-sm p-4 w-60"
                style={{
                  animationName: "float",
                  animationDuration: "4s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: "2s",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Career Growth
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      100+ resources tersedia
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div
                className="float-animation absolute bottom-8 right-8 bg-navy rounded-xl p-4 w-48 text-white shadow-lg"
                style={{
                  animationName: "float",
                  animationDuration: "4s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: "0.5s",
                }}
              >
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-white/70">Job Opportunities</div>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-white/60 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
