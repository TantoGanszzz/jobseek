import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero-section";
import StackFeatureSection from "@/components/ui/stack-feature-section";
import JobSearch from "@/components/job-search";
import FeaturedJobs from "@/components/featured-jobs";
import CareerResources from "@/components/career-resources";
import Statistics from "@/components/statistics";
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight max-w-xl mx-auto">
            Ready to Build Your Future?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
            Bergabung dengan ribuan pencari kerja yang telah menemukan karier
            impian mereka.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-navy text-white hover:bg-navy-light font-medium h-12 px-8 text-base cursor-pointer"
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
