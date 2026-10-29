"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { LESSONS, LEVELS, lessonsByLevel } from "@/lib/content/lessons";
import { percent } from "@/lib/format";
import { useAppStore } from "@/lib/store/app-store";
import { Card, PageHeader, ProgressBar } from "@/components/ui/primitives";

export function LearnIndexView() {
  const completed = useAppStore((s) => s.completedLessons);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Learn SQL"
        description={`${LESSONS.length} materi dari dasar hingga lanjutan. Setiap materi punya contoh yang bisa langsung dijalankan dan latihan.`}
      />
      {LEVELS.map((level) => {
        const lessons = lessonsByLevel(level.id);
        const done = lessons.filter((l) => completed.includes(l.slug)).length;
        // Lesson numbers are global across levels, like the PRD's list.
        const offset = LESSONS.indexOf(lessons[0]);
        return (
          <section key={level.id} id={level.id} className="scroll-mt-20">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{level.label}</h2>
                <p className="text-sm text-slate-500">{level.description}</p>
              </div>
              <div className="flex w-48 items-center gap-2 text-xs text-slate-500">
                <ProgressBar value={percent(done, lessons.length)} className="flex-1" />
                {done}/{lessons.length}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {lessons.map((lesson, i) => {
                const isDone = completed.includes(lesson.slug);
                return (
                  <Link key={lesson.slug} href={`/learn/${lesson.slug}`}>
                    <Card className="flex h-full items-start gap-3 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40">
                      <span className="mt-0.5 font-mono text-xs text-slate-400">{String(offset + i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{lesson.title}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{lesson.summary}</p>
                      </div>
                      {isDone ? (
                        <CheckCircle2 size={18} className="shrink-0 text-success" aria-label="Selesai" />
                      ) : (
                        <Circle size={18} className="shrink-0 text-slate-300" aria-label="Belum selesai" />
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
