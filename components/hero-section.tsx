import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-18 sm:px-8 sm:pt-10 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-28">
        <div className="rounded-[40px] border border-brand-border bg-transparent overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center p-8 sm:p-10 lg:p-12">
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
            <div className="relative h-[600px] w-full overflow-hidden rounded-3xl ">
              <Image
                src="/photos/hero/gambar-orang.png"
                alt="Illustration"
                fill
                priority
                className="object-cover object-center"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
