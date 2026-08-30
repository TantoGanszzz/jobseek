import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "jobseek — Prove Your Skills. Find Your Career.",
    template: "%s | jobseek",
  },
  description:
    "JobSeek is a career operating system to discover jobs, build skills, prove them with assessments, and get hired.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full text-slate-900">{children}</body>
    </html>
  );
}