import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/demo/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | jobseek",
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}