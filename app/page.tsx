import InteractiveCursorBackground from "@/components/interactive-cursor-background";
import HeroSection from "@/components/hero-section";
import StackFeatureSection from "@/components/ui/stack-feature-section";
import JobSearch from "@/components/job-search";
import FeaturedJobs from "@/components/featured-jobs";
import CareerResources from "@/components/career-resources";
import Statistics from "@/components/statistics";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Technology Orbit */}
      <StackFeatureSection />

      {/* Find Jobs (Public) */}
      <JobSearch />

      {/* Featured Jobs */}
      <FeaturedJobs />

      {/* Career Resources */}
      <CareerResources />

      {/* Statistics */}
      <Statistics />

      {/* CTA Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Ready to Build Your Future?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
            Bergabung dengan ribuan pencari kerja yang telah menemukan karier
            impian mereka.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 cursor-pointer bg-navy px-8 text-base font-medium text-white hover:bg-navy-light"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
