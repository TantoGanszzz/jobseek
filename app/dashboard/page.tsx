import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/job-card";
import {
  Search,
  User,
  BookOpen,
  FolderKanban,
  Briefcase,
  Bookmark,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Activity,
} from "lucide-react";
import type { Job } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Dashboard — Jobseek",
  description: "Kelola pencarian pekerjaan dan profil karier Anda.",
};

function calculateProfileCompletion(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;
  const fields = ["full_name", "headline", "phone", "location", "bio", "skills", "resume_url", "avatar_url"];
  let filled = 0;
  for (const field of fields) {
    const val = profile[field];
    if (val !== null && val !== undefined && val !== "") {
      if (Array.isArray(val) && val.length === 0) continue;
      filled++;
    }
  }
  return Math.round((filled / fields.length) * 100);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  let profile: Record<string, unknown> | null = null;
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
    (profile?.full_name as string) || user?.user_metadata?.full_name || "User";

  // Fetch real stats
  let applicationCount = 0;
  let savedJobCount = 0;
  let recommendationCount = 0;

  try {
    const { count: appCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id);
    applicationCount = appCount || 0;
  } catch {
    // Table might not exist
  }

  try {
    const { count: savedCount } = await supabase
      .from("saved_jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id);
    savedJobCount = savedCount || 0;
  } catch {
    // Table might not exist
  }

  // Fetch job recommendations (latest jobs)
  let recommendations: Job[] = [];
  try {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*, company:companies(*)")
      .order("created_at", { ascending: false })
      .limit(4);
    recommendations = (jobs as Job[]) || [];
    recommendationCount = recommendations.length;
  } catch {
    // Table might not exist
  }

  // Fetch recent activity
  let activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    created_at: string;
  }> = [];
  try {
    const { data: acts } = await supabase
      .from("activities")
      .select("id, type, title, description, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5);
    activities = acts || [];
  } catch {
    // Table might not exist
  }

  const profileCompletion = calculateProfileCompletion(profile);

  const stats = [
    {
      icon: Briefcase,
      label: "Lamaran Terkirim",
      value: applicationCount.toString(),
      emptyText: "Belum ada lamaran",
    },
    {
      icon: Bookmark,
      label: "Job Disimpan",
      value: savedJobCount.toString(),
      emptyText: "Belum ada job disimpan",
    },
    {
      icon: TrendingUp,
      label: "Rekomendasi",
      value: recommendationCount.toString(),
      emptyText: "Belum ada rekomendasi",
    },
    {
      icon: UserCheck,
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      emptyText: "Lengkapi profil Anda",
    },
  ];

  const quickActions = [
    {
      icon: Search,
      title: "Cari Pekerjaan",
      description: "Temukan pekerjaan yang sesuai dengan skill Anda",
      href: "/dashboard/find-jobs",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: User,
      title: "Edit Profil",
      description: "Lengkapi profil untuk meningkatkan peluang",
      href: "/dashboard/profile",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: BookOpen,
      title: "Mulai Belajar",
      description: "Kembangkan skill untuk karier Anda",
      href: "/dashboard/learning",
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: FolderKanban,
      title: "Buat Portfolio",
      description: "Tampilkan proyek dan karya terbaik Anda",
      href: "/dashboard/portfolio",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  function getActivityIcon(type: string) {
    switch (type) {
      case "application":
        return Briefcase;
      case "save":
        return Bookmark;
      case "profile":
        return User;
      case "learning":
        return BookOpen;
      default:
        return Activity;
    }
  }

  function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">
          Selamat datang kembali, {userName} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pantau perjalanan karier dan temukan peluang yang sesuai dengan Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-brand-border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
              <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-navy" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-navy">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                {stat.value === "0" || stat.value === "0%"
                  ? stat.emptyText
                  : stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group bg-white rounded-xl border border-brand-border p-4 sm:p-5 hover:shadow-lg hover:border-navy/20 transition-all duration-300"
            >
              <div
                className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-navy text-sm sm:text-base mb-1">
                {action.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {action.description}
              </p>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-navy flex items-center gap-1 group-hover:gap-2 transition-all">
                Buka
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout: Activity + Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">
            Aktivitas Terbaru
          </h2>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-light-bg transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-navy/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {timeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-navy/15 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-1">
                Belum ada aktivitas.
              </p>
              <p className="text-muted-foreground/70 text-xs mb-4">
                Mulai perjalanan karier Anda dengan mencari pekerjaan.
              </p>
              <Link href="/dashboard/find-jobs">
                <Button
                  size="sm"
                  className="bg-navy text-white hover:bg-navy-light cursor-pointer"
                >
                  <Search className="mr-2 h-3.5 w-3.5" />
                  Cari Pekerjaan
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Job Recommendations */}
        <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy">
              Rekomendasi Pekerjaan
            </h2>
            {recommendations.length > 0 && (
              <Link
                href="/dashboard/find-jobs"
                className="text-xs font-medium text-navy/60 hover:text-navy transition-colors"
              >
                Lihat Semua
              </Link>
            )}
          </div>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-navy/15 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-1">
                Belum ada rekomendasi pekerjaan.
              </p>
              <p className="text-muted-foreground/70 text-xs mb-4">
                Lengkapi profil untuk mendapatkan rekomendasi yang sesuai.
              </p>
              <Link href="/dashboard/profile">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-brand-border text-navy hover:bg-navy hover:text-white cursor-pointer"
                >
                  <User className="mr-2 h-3.5 w-3.5" />
                  Lengkapi Profil
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
