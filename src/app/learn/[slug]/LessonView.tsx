"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ExternalLink, Eye, Play, Trophy } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useDataset } from "@/hooks/useDataset";
import { useSqlRunner } from "@/hooks/useSqlRunner";
import { getChallenge } from "@/lib/content/challenges";
import { LESSONS, LEVELS, getLesson } from "@/lib/content/lessons";
import { getDataset } from "@/lib/datasets";
import { checkAnswer, type CheckOutcome } from "@/lib/sql/checker";
import { execScratch } from "@/lib/sql/engine";
import type { QueryResult } from "@/lib/sql/types";
import { useAppStore } from "@/lib/store/app-store";
import { CheckFeedback } from "@/components/sql/CheckFeedback";
import { ResultPanel, SqlErrorBox } from "@/components/sql/ResultPanel";
import { ResultTable } from "@/components/sql/ResultTable";
import { SqlEditor } from "@/components/sql/SqlEditor";
import { CodeBlock, Markdown } from "@/components/ui/Markdown";
import { Badge, Button, Card, DIFFICULTY_TONE, Spinner } from "@/components/ui/primitives";

function Section({ step, title, children, aside }: { step: number; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-white">{step}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function LessonView({ slug }: { slug: string }) {
  const lesson = getLesson(slug)!;
  const router = useRouter();
  const db = useDataset(lesson.dataset);
  const completed = useAppStore((s) => s.completedLessons.includes(slug));
  const { completeLesson, uncompleteLesson, visitLesson, openInPlayground } = useAppStore.getState();

  const index = LESSONS.indexOf(lesson);
  const prev = LESSONS[index - 1];
  const next = LESSONS[index + 1];
  const level = LEVELS.find((l) => l.id === lesson.level)!;

  // Interactive query
  const [sql, setSql] = useState(lesson.example);
  const runner = useSqlRunner(lesson.dataset, { mode: "scratch" });

  // Expected result of the example, computed live from the dataset.
  const [expected, setExpected] = useState<{ slug: string; result?: QueryResult; error?: string } | null>(null);

  // Practice
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const practiceRunner = useSqlRunner(lesson.dataset, { mode: "scratch", record: false });

  useEffect(() => {
    visitLesson(slug);
  }, [slug, visitLesson]);

  useEffect(() => {
    let cancelled = false;
    execScratch(lesson.dataset, lesson.example)
      .then((result) => !cancelled && setExpected({ slug, result }))
      .catch((e: Error) => !cancelled && setExpected({ slug, error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [slug, lesson.dataset, lesson.example]);

  const tryQuery = () => {
    openInPlayground(lesson.example, lesson.dataset);
    router.push("/playground");
  };

  const check = async () => {
    setChecking(true);
    practiceRunner.reset();
    const result = await checkAnswer({
      dataset: lesson.dataset,
      userSql: answer,
      solution: lesson.practice.solution,
      checkSql: lesson.practice.checkSql,
      orderMatters: lesson.practice.orderMatters,
    });
    setOutcome(result);
    setChecking(false);
    if (result.status === "correct" || result.status === "incorrect") practiceRunner.showResult(result.output, answer);
    if (result.status === "correct") completeLesson(slug);
  };

  const expectedForThis = expected?.slug === slug ? expected : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <Link href={`/learn#${lesson.level}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
          <ArrowLeft size={14} /> Learn SQL
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="primary">{level.label}</Badge>
              <Badge>Materi {index + 1} / {LESSONS.length}</Badge>
              <Badge tone="info">Dataset: {getDataset(lesson.dataset).name}</Badge>
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{lesson.title}</h1>
            <p className="mt-1 text-slate-500">{lesson.summary}</p>
          </div>
          <Button variant={completed ? "success" : "secondary"} onClick={() => (completed ? uncompleteLesson(slug) : completeLesson(slug))}>
            {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {completed ? "Selesai" : "Tandai selesai"}
          </Button>
        </div>
      </div>

      <Section step={1} title="Explanation">
        <Card className="px-6 py-3">
          <Markdown text={lesson.explanation} />
        </Card>
      </Section>

      <Section
        step={2}
        title="Example"
        aside={
          <Button size="sm" onClick={tryQuery}>
            <ExternalLink size={14} /> Try Query
          </Button>
        }
      >
        <CodeBlock code={lesson.example} />
      </Section>

      <Section step={3} title="Interactive Query">
        <Card className="overflow-hidden">
          <div className="h-44 bg-[#1e1e1e]">
            <SqlEditor value={sql} onChange={setSql} onRun={() => runner.run(sql)} schema={db.schema} error={runner.state.kind === "error" ? runner.state.message : null} />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
            <p className="text-xs text-slate-500">Ubah query lalu jalankan. Data selalu dimulai dari kondisi awal.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSql(lesson.example)}>
                Reset
              </Button>
              <Button size="sm" onClick={() => runner.run(sql)} disabled={runner.state.kind === "running"}>
                <Play size={14} /> Run
              </Button>
            </div>
          </div>
          {runner.state.kind !== "idle" && (
            <div className="max-h-80 overflow-auto border-t border-slate-200">
              <ResultPanel state={runner.state} schema={db.schema} pageSize={20} />
            </div>
          )}
        </Card>
      </Section>

      <Section step={4} title="Expected Result">
        <Card className="overflow-hidden">
          <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">Hasil dari query contoh di atas:</p>
          {!expectedForThis && (
            <p className="flex items-center gap-2 p-4 text-sm text-slate-500">
              <Spinner /> Menjalankan contoh…
            </p>
          )}
          {expectedForThis?.error && <SqlErrorBox message={expectedForThis.error} />}
          {expectedForThis?.result &&
            (expectedForThis.result.statementsWithRows === 0 ? (
              <p className="p-4 text-sm text-slate-600">Query berhasil. {expectedForThis.result.rowsModified} baris terpengaruh.</p>
            ) : (
              <ResultTable result={expectedForThis.result} compact pageSize={10} maxHeight="320px" />
            ))}
        </Card>
      </Section>

      <Section step={5} title="Practice">
        <Card className="overflow-hidden">
          <div className="px-4 py-3">
            <Markdown text={lesson.practice.task} />
          </div>
          <div className="h-40 bg-[#1e1e1e]">
            <SqlEditor value={answer} onChange={setAnswer} onRun={check} schema={db.schema} error={outcome?.status === "error" ? outcome.message : null} />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
            <button onClick={() => setShowSolution((s) => !s)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary">
              <Eye size={13} /> {showSolution ? "Sembunyikan jawaban" : "Lihat jawaban"}
            </button>
            <Button size="sm" variant="success" onClick={check} disabled={checking}>
              {checking ? <Spinner className="h-3.5 w-3.5" /> : <CheckCircle2 size={14} />} Run & Check
            </Button>
          </div>
          {showSolution && (
            <div className="border-t border-slate-200 px-4">
              <CodeBlock code={lesson.practice.solution} />
            </div>
          )}
          {outcome && (
            <div className="border-t border-slate-200 p-4">
              <CheckFeedback outcome={outcome} schema={db.schema} />
              {outcome.status === "correct" && <p className="mt-2 text-sm text-slate-600">Materi ini ditandai selesai. 🎉</p>}
            </div>
          )}
          {practiceRunner.state.kind !== "idle" && (
            <div className="max-h-80 overflow-auto border-t border-slate-200">
              <ResultPanel state={practiceRunner.state} schema={db.schema} pageSize={20} />
            </div>
          )}
        </Card>
      </Section>

      <Section step={6} title="Challenge">
        {lesson.challengeIds.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada challenge khusus untuk materi ini.{" "}
            <Link href="/challenges" className="text-primary hover:underline">
              Lihat semua challenge
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {lesson.challengeIds.map((id) => {
              const c = getChallenge(id);
              if (!c) return null;
              return (
                <Link key={id} href={`/challenges/${id}`}>
                  <Card className="flex items-center gap-3 p-4 hover:border-primary-300">
                    <Trophy size={18} className="text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.category}</p>
                    </div>
                    <Badge tone={DIFFICULTY_TONE[c.difficulty]}>{c.difficulty}</Badge>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      <nav className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="group text-sm">
            <span className="flex items-center gap-1 text-slate-500">
              <ArrowLeft size={14} /> Sebelumnya
            </span>
            <span className="font-medium text-slate-900 group-hover:text-primary">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${next.slug}`} className="group text-right text-sm">
            <span className="flex items-center justify-end gap-1 text-slate-500">
              Berikutnya <ArrowRight size={14} />
            </span>
            <span className="font-medium text-slate-900 group-hover:text-primary">{next.title}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
