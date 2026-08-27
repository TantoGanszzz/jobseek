"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiDocker,
  SiPython,
  SiGithub,
  SiFigma,
  SiLaravel,
} from "react-icons/si";
import { BookOpen, Zap } from "lucide-react";

const innerIcons = [
  { icon: SiReact, label: "React", color: "#0B1F3A" },
  { icon: SiNextdotjs, label: "Next.js", color: "#0B1F3A" },
  { icon: SiTypescript, label: "TypeScript", color: "#0B1F3A" },
];

const middleIcons = [
  { icon: SiJavascript, label: "JavaScript", color: "#0B1F3A" },
  { icon: SiNodedotjs, label: "Node.js", color: "#0B1F3A" },
  { icon: SiDocker, label: "Docker", color: "#0B1F3A" },
  { icon: SiPython, label: "Python", color: "#0B1F3A" },
];

const outerIcons = [
  { icon: SiGithub, label: "GitHub", color: "#0B1F3A" },
  { icon: SiFigma, label: "Figma", color: "#0B1F3A" },
  { icon: SiLaravel, label: "Laravel", color: "#0B1F3A" },
];

function OrbitRing({
  radius,
  duration,
  icons,
  reverse = false,
}: {
  radius: number;
  duration: number;
  icons: typeof innerIcons;
  reverse?: boolean;
}) {
  const direction = reverse ? "reverse" : "normal";

  return (
    <div
      className="orbit-ring absolute rounded-full border border-dotted border-brand-border"
      style={{
        width: radius * 2,
        height: radius * 2,
        top: `calc(50% - ${radius}px)`,
        left: `calc(50% - ${radius}px)`,
        animationName: "orbit-rotate",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: direction,
      }}
    >
      {icons.map((item, index) => {
        const angle = (360 / icons.length) * index;
        const rad = (angle * Math.PI) / 180;
        
        // Round to 2 decimal places to guarantee matching outputs on server and client
        const xOffset = Number((Math.cos(rad) * radius - 18).toFixed(2));
        const yOffset = Number((Math.sin(rad) * radius - 18).toFixed(2));
        
        const topVal = `calc(50% ${yOffset >= 0 ? "+" : "-"} ${Math.abs(yOffset)}px)`;
        const leftVal = `calc(50% ${xOffset >= 0 ? "+" : "-"} ${Math.abs(xOffset)}px)`;
        
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="orbit-icon absolute flex items-center justify-center"
            style={{
              top: topVal,
              left: leftVal,
              animationName: reverse ? "orbit-rotate" : "orbit-counter-rotate",
              animationDuration: `${duration}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
            title={item.label}
          >
            <div className="h-9 w-9 rounded-full bg-white border border-brand-border shadow-sm flex items-center justify-center hover:shadow-md hover:border-navy/30 transition-all">
              <Icon
                className="h-4 w-4"
                style={{ color: item.color }}
                aria-label={item.label}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StackFeatureSection() {
  return (
    <section className="bg-light-bg py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Orbit */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] mx-auto">
              {/* Center Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="h-16 w-16 rounded-full bg-navy flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">JS</span>
                </div>
              </div>

              {/* Orbit Rings */}
              <OrbitRing radius={80} duration={25} icons={innerIcons} />
              <OrbitRing
                radius={130}
                duration={35}
                icons={middleIcons}
                reverse
              />
              <OrbitRing radius={180} duration={45} icons={outerIcons} />
            </div>
          </div>

          {/* Right — Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-border text-xs font-medium text-navy">
              <Zap className="h-3.5 w-3.5" />
              Skills & Technologies
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
              Skills That Move Your Career Forward
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Kuasai teknologi yang paling dibutuhkan di industri. Dari frontend
              hingga cloud, kami membantu Anda menemukan jalur belajar yang
              tepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/find-jobs">
                <Button
                  size="lg"
                  className="bg-navy text-white hover:bg-navy-light font-medium h-11 px-6 cursor-pointer"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore Skills
                </Button>
              </Link>
              <Link href="#resources">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-navy text-navy hover:bg-navy/5 font-medium h-11 px-6 cursor-pointer"
                >
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
