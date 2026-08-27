import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  BookOpen,
  Briefcase,
  Bookmark,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Jobseek",
  description: "Kelola pencarian pekerjaan dan profil karier Anda.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try to get profile
  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    profile = data;
  } catch {
    // Profile table might not exist yet
  }

  const userName =
    profile?.full_name || user?.user_metadata?.full_name || "User";

  // Mock stats — replace with real queries when tables exist
  const stats = [
    {
      icon: Briefcase,
      label: "Lamaran Terkirim",
      value: "0",
      color: "bg-navy/5",
    },
    {
      icon: Bookmark,
      label: "Job Disimpan",
      value: "0",
      color: "bg-navy/5",
    },
    {
      icon: TrendingUp,
      label: "Rekomendasi",
      value: "8",
      color: "bg-navy/5",
    },
  ];

  const quickActions = [
    {
      icon: Search,
      title: "Find Jobs",
      description: "Cari pekerjaan yang sesuai dengan skill Anda",
      href: "/dashboard/find-jobs",
    },
    {
      icon: User,
      title: "Update Profile",
      description: "Lengkapi profil untuk meningkatkan peluang",
      href: "/dashboard/profile",
    },
    {
      icon: BookOpen,
      title: "Career Resources",
      description: "Akses panduan dan resource karier",
      href: "/#resources",
    },
  ];

  return (
    <div className="bg-light-bg min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">
            Selamat datang kembali, {userName} 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Berikut ringkasan aktivitas pencarian kerja Anda.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-brand-border p-5 flex items-center gap-4"
            >
              <div
                className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}
              >
                <stat.icon className="h-6 w-6 text-navy" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-white rounded-xl border border-brand-border p-6 hover:shadow-lg hover:border-navy/20 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-navy/5 flex items-center justify-center mb-4 group-hover:bg-navy group-hover:text-white transition-all duration-300">
                  <action.icon className="h-5 w-5 text-navy group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-navy mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
                <div className="mt-3 text-sm font-medium text-navy flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-xl border border-brand-border p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-navy/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Belum ada aktivitas. Mulai dengan mencari pekerjaan!
            </p>
            <Link href="/dashboard/find-jobs">
              <Button className="mt-4 bg-navy text-white hover:bg-navy-light cursor-pointer">
                <Search className="mr-2 h-4 w-4" />
                Cari Pekerjaan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
