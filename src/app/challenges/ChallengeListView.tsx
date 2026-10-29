"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { CATEGORIES, CHALLENGES, DIFFICULTIES, type Difficulty } from "@/lib/content/challenges";
import { getDataset } from "@/lib/datasets";
import { percent } from "@/lib/format";
import { useAppStore } from "@/lib/store/app-store";
import { Badge, Card, DIFFICULTY_TONE, EmptyState, PageHeader, ProgressBar } from "@/components/ui/primitives";

export function ChallengeListView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const completed = useAppStore((s) => s.completedChallenges);

  const level = params.get("level") as Difficulty | null;
  const category = params.get("category");

  const setFilter = (key: "level" | "category", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = CHALLENGES.filter((c) => (!level || c.difficulty === level) && (!category || c.category === category));
  const doneCount = CHALLENGES.filter((c) => completed[c.id]).length;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active ? "border-primary bg-primary text-white" : "border-slate-300 bg-white text-slate-600 hover:border-primary-300"
    }`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="SQL Challenges"
        description="Tulis query untuk menyelesaikan soal. Jawaban dicek berdasarkan hasil query, bukan teks query-nya."
        actions={
          <div className="w-56 text-right text-sm text-slate-500">
            {doneCount} / {CHALLENGES.length} completed
            <ProgressBar value={percent(doneCount, CHALLENGES.length)} className="mt-1" />
          </div>
        }
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs font-medium text-slate-500">Level</span>
          <button className={chip(!level)} onClick={() => setFilter("level", null)}>
            Semua
          </button>
          {DIFFICULTIES.map((d) => (
            <button key={d.id} className={chip(level === d.id)} onClick={() => setFilter("level", d.id)}>
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs font-medium text-slate-500">Kategori</span>
          <button className={chip(!category)} onClick={() => setFilter("category", null)}>
            Semua
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} className={chip(category === c)} onClick={() => setFilter("category", c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState title="Tidak ada challenge" description="Belum ada challenge untuk kombinasi filter ini." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((c) => {
            const done = completed[c.id];
            return (
              <Link key={c.id} href={`/challenges/${c.id}`}>
                <Card className="flex h-full items-start gap-3 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40">
                  {done ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" /> : <Circle size={20} className="mt-0.5 shrink-0 text-slate-300" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      <span className="mr-1.5 font-mono text-xs text-slate-400">#{c.id}</span>
                      {c.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone={DIFFICULTY_TONE[c.difficulty]}>{c.difficulty}</Badge>
                      <Badge>{c.category}</Badge>
                      <Badge tone="info">{getDataset(c.dataset).name}</Badge>
                      {done && done.hintsUsed > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
                          <Lightbulb size={12} /> {done.hintsUsed} hint
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
