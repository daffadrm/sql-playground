"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle, SquareTerminal, Terminal, Trophy, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { CHALLENGES, getChallenge } from "@/lib/content/challenges";
import { LESSONS, LEVELS, getLesson, lessonsByLevel } from "@/lib/content/lessons";
import { formatNumber, percent, relativeTime } from "@/lib/format";
import { useAppStore, useHydration } from "@/lib/store/app-store";
import { Card, ProgressBar, Spinner } from "@/components/ui/primitives";

function StatCard({ icon, label, children, footer }: { icon: ReactNode; label: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Card className="flex flex-col p-5">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon} {label}
      </p>
      <div className="mt-2 flex-1">{children}</div>
      {footer && <div className="mt-3 text-sm">{footer}</div>}
    </Card>
  );
}

export function DashboardView() {
  const hydrated = useHydration((s) => s.hydrated);
  const completedLessons = useAppStore((s) => s.completedLessons);
  const completedChallenges = useAppStore((s) => s.completedChallenges);
  const lastLessonSlug = useAppStore((s) => s.lastLesson);
  const lastChallengeId = useAppStore((s) => s.lastChallenge);
  const queriesExecuted = useAppStore((s) => s.queriesExecuted);
  const history = useAppStore((s) => s.history);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Spinner /> Memuat progress…
      </div>
    );
  }

  const lessonsDone = LESSONS.filter((l) => completedLessons.includes(l.slug)).length;
  const challengesDone = CHALLENGES.filter((c) => completedChallenges[c.id]).length;
  const progress = percent(lessonsDone, LESSONS.length);
  const lastLesson = lastLessonSlug ? getLesson(lastLessonSlug) : undefined;
  const lastChallenge = lastChallengeId ? getChallenge(lastChallengeId) : undefined;
  const nextLesson = LESSONS.find((l) => !completedLessons.includes(l.slug));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-primary px-6 py-7 text-white">
        <p className="text-sm text-primary-200">Selamat datang di</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">SQL Learning Playground</h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-100">
          Pelajari konsep SQL, jalankan query langsung di browser, lalu uji kemampuanmu lewat challenge dengan validasi otomatis.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={nextLesson ? `/learn/${nextLesson.slug}` : "/learn"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50"
          >
            <BookOpen size={16} /> {lessonsDone === 0 ? "Mulai belajar" : nextLesson ? `Lanjut: ${nextLesson.title}` : "Semua materi selesai"}
          </Link>
          <Link href="/playground" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
            <SquareTerminal size={16} /> Buka Playground
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BookOpen size={14} />} label="Progress">
          <p className="text-3xl font-semibold text-slate-900">{progress}%</p>
          <ProgressBar value={progress} className="mt-2" />
          <p className="mt-2 text-xs text-slate-500">
            {lessonsDone} dari {LESSONS.length} materi selesai
          </p>
        </StatCard>

        <StatCard
          icon={<BookOpen size={14} />}
          label="Materi terakhir"
          footer={
            <Link href={lastLesson ? `/learn/${lastLesson.slug}` : "/learn"} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              {lastLesson ? "Lanjutkan" : "Lihat materi"} <ArrowRight size={14} />
            </Link>
          }
        >
          <p className="text-xl font-semibold text-slate-900">{lastLesson?.title ?? "—"}</p>
          {lastLesson && <p className="text-xs capitalize text-slate-500">{lastLesson.level}</p>}
        </StatCard>

        <StatCard
          icon={<Trophy size={14} />}
          label="Challenge"
          footer={
            <Link href={lastChallenge ? `/challenges/${lastChallenge.id}` : "/challenges"} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              {lastChallenge ? `Terakhir: ${lastChallenge.title}` : "Mulai challenge"} <ArrowRight size={14} />
            </Link>
          }
        >
          <p className="text-3xl font-semibold text-slate-900">
            {challengesDone} <span className="text-base font-normal text-slate-400">/ {CHALLENGES.length}</span>
          </p>
          <p className="text-xs text-slate-500">completed</p>
        </StatCard>

        <StatCard icon={<Terminal size={14} />} label="Queries executed">
          <p className="text-3xl font-semibold text-slate-900">{formatNumber(queriesExecuted)}</p>
          <p className="text-xs text-slate-500">query dijalankan</p>
        </StatCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold text-slate-900">SQL Progress</h2>
          <div className="mt-4 space-y-4">
            {LEVELS.map((level) => {
              const lessons = lessonsByLevel(level.id);
              const done = lessons.filter((l) => completedLessons.includes(l.slug)).length;
              const p = percent(done, lessons.length);
              return (
                <Link key={level.id} href={`/learn#${level.id}`} className="block">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{level.label}</span>
                    <span className="font-medium text-slate-900">{p}%</span>
                  </div>
                  <ProgressBar value={p} className="mt-1.5" />
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Topik</h2>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
            {LESSONS.map((l) => {
              const done = completedLessons.includes(l.slug);
              return (
                <li key={l.slug}>
                  <Link href={`/learn/${l.slug}`} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-slate-50">
                    {done ? <CheckCircle2 size={15} className="shrink-0 text-success" /> : <Circle size={15} className="shrink-0 text-slate-300" />}
                    <span className={done ? "text-slate-800" : "text-slate-500"}>{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Query terakhir</h2>
          <Link href="/history" className="text-sm text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Belum ada query yang dijalankan.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {history.slice(0, 5).map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-2">
                {h.status === "success" ? <CheckCircle2 size={15} className="shrink-0 text-success" /> : <XCircle size={15} className="shrink-0 text-error" />}
                <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-slate-700">{h.sql.replace(/\s+/g, " ")}</code>
                <span className="shrink-0 text-xs text-slate-400">{relativeTime(h.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
