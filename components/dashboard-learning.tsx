"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Play,
  Trophy,
} from "lucide-react";
import type { Course, LearningProgress } from "@/types/database.types";

interface DashboardLearningClientProps {
  courses: Course[];
  progress: LearningProgress[];
}

function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-green-50 text-green-700 border-green-200";
    case "intermediate":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "advanced":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-light-bg text-navy border-brand-border";
  }
}

export default function DashboardLearningClient({
  courses,
  progress,
}: DashboardLearningClientProps) {
  const inProgressCourses = progress.filter(
    (p) => p.status === "in_progress" && p.course
  );
  const completedCourses = progress.filter(
    (p) => p.status === "completed" && p.course
  );
  const startedCourseIds = new Set(progress.map((p) => p.course_id));
  const recommendedCourses = courses.filter((c) => !startedCourseIds.has(c.id));

  const hasAnyContent =
    inProgressCourses.length > 0 ||
    completedCourses.length > 0 ||
    recommendedCourses.length > 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">Learning</h1>
        <p className="mt-2 text-muted-foreground">
          Kembangkan skill Anda dan persiapkan diri untuk peluang karier
          berikutnya.
        </p>
      </div>

      {hasAnyContent ? (
        <div className="space-y-8">
          {/* Continue Learning */}
          {inProgressCourses.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Lanjutkan Belajar
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressCourses.map((lp) => (
                  <CourseCard
                    key={lp.id}
                    course={lp.course!}
                    progress={lp.progress_pct}
                    status="in_progress"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recommended */}
          {recommendedCourses.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Rekomendasi Kursus
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          )}

          {/* Skill Progress */}
          {progress.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Skill Progress
              </h2>
              <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6">
                <div className="space-y-4">
                  {progress.slice(0, 5).map((lp) => (
                    <div key={lp.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-navy">
                          {lp.course?.title || "Kursus"}
                        </span>
                        <span className="text-muted-foreground">
                          {lp.progress_pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-light-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy rounded-full transition-all duration-500"
                          style={{ width: `${lp.progress_pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Completed */}
          {completedCourses.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Kursus Selesai
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCourses.map((lp) => (
                  <CourseCard
                    key={lp.id}
                    course={lp.course!}
                    progress={100}
                    status="completed"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-brand-border p-12 text-center max-w-lg mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-navy/5 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-navy/30" />
          </div>
          <h3 className="text-lg font-semibold text-navy mb-2">
            Mulai Perjalanan Belajar Anda
          </h3>
          <p className="text-muted-foreground text-sm mb-1">
            Belum ada kursus atau materi pembelajaran tersedia.
          </p>
          <p className="text-muted-foreground/70 text-xs mb-6">
            Kembangkan skill Anda dengan mengikuti kursus yang relevan dengan
            karier impian Anda.
          </p>
          <Link href="/dashboard/find-jobs">
            <Button className="bg-navy text-white hover:bg-navy-light cursor-pointer">
              Cari Pekerjaan Dulu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  progress,
  status,
}: {
  course: Course;
  progress?: number;
  status?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-brand-border p-5 hover:shadow-lg hover:border-navy/20 transition-all duration-300 group">
      {/* Category & Difficulty */}
      <div className="flex items-center gap-2 mb-3">
        {course.skill_category && (
          <span className="px-2 py-0.5 text-xs bg-navy/5 text-navy rounded-md font-medium">
            {course.skill_category}
          </span>
        )}
        {course.difficulty && (
          <span
            className={`px-2 py-0.5 text-xs rounded-md font-medium border ${getDifficultyColor(
              course.difficulty
            )}`}
          >
            {course.difficulty}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-navy mb-1 group-hover:text-navy-light transition-colors">
        {course.title}
      </h3>
      {course.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {course.description}
        </p>
      )}

      {/* Duration */}
      {course.estimated_duration && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Clock className="h-3 w-3" />
          {course.estimated_duration}
        </div>
      )}

      {/* Progress Bar */}
      {progress !== undefined && progress > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-navy">{progress}%</span>
          </div>
          <div className="h-1.5 bg-light-bg rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === "completed" ? "bg-green-500" : "bg-navy"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <Button
        size="sm"
        className={`w-full font-medium cursor-pointer transition-all ${
          status === "completed"
            ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            : status === "in_progress"
            ? "bg-navy text-white hover:bg-navy-light"
            : "bg-navy/5 text-navy hover:bg-navy hover:text-white border border-brand-border"
        }`}
      >
        {status === "completed"
          ? "Selesai ✓"
          : status === "in_progress"
          ? "Lanjutkan"
          : "Mulai Belajar"}
      </Button>
    </div>
  );
}
