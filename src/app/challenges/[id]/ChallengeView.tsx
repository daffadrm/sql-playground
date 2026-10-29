"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lightbulb, Link2, Play, RotateCcw, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDataset } from "@/hooks/useDataset";
import { useSqlRunner } from "@/hooks/useSqlRunner";
import { CHALLENGES, getChallenge } from "@/lib/content/challenges";
import { getDataset } from "@/lib/datasets";
import { checkAnswer, type CheckOutcome } from "@/lib/sql/checker";
import { useAppStore } from "@/lib/store/app-store";
import { toast } from "@/lib/store/toast-store";
import { CheckFeedback } from "@/components/sql/CheckFeedback";
import { ResultPanel } from "@/components/sql/ResultPanel";
import { SqlEditor, formatSql } from "@/components/sql/SqlEditor";
import { Markdown } from "@/components/ui/Markdown";
import { Badge, Button, Card, DIFFICULTY_TONE, Spinner } from "@/components/ui/primitives";

export function ChallengeView({ id }: { id: number }) {
  const challenge = getChallenge(id)!;
  const db = useDataset(challenge.dataset);
  const runner = useSqlRunner(challenge.dataset, { mode: "scratch" });

  const draft = useAppStore((s) => s.challengeDrafts[id]);
  const hintsRevealed = useAppStore((s) => s.hintsRevealed[id] ?? 0);
  const completion = useAppStore((s) => s.completedChallenges[id]);
  const { saveChallengeDraft, revealHint, completeChallenge, visitChallenge, recordQuery } = useAppStore.getState();

  // null = user hasn't typed yet in this visit, so show the saved draft
  const [typed, setTyped] = useState<string | null>(null);
  const answer = typed ?? draft ?? "";
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    visitChallenge(id);
  }, [id, visitChallenge]);

  const setAnswer = (sql: string) => {
    setTyped(sql);
    saveChallengeDraft(id, sql);
  };

  const run = () => {
    setOutcome(null);
    runner.run(answer);
  };

  const check = async () => {
    setChecking(true);
    runner.reset();
    const result = await checkAnswer({
      dataset: challenge.dataset,
      userSql: answer,
      solution: challenge.solution,
      checkSql: challenge.checkSql,
      orderMatters: challenge.orderMatters,
    });
    setOutcome(result);
    setChecking(false);
    if (result.status === "correct" || result.status === "incorrect") runner.showResult(result.output, answer);
    if (result.status !== "empty") {
      recordQuery({
        sql: answer,
        dataset: challenge.dataset,
        status: result.status === "error" ? "error" : "success",
        timeMs: result.status === "error" ? 0 : result.actual.timeMs,
        rowCount: result.status === "error" ? null : result.actual.rows.length,
        error: result.status === "error" ? result.message : undefined,
      });
    }
    if (result.status === "correct") completeChallenge(id);
  };

  const format = () => {
    try {
      setAnswer(formatSql(answer));
    } catch {
      toast("Query belum bisa diformat — cek syntax-nya dulu.", "error");
    }
  };

  const index = CHALLENGES.findIndex((c) => c.id === id);
  const next = CHALLENGES[index + 1];
  const editorError = outcome?.status === "error" ? outcome.message : runner.state.kind === "error" ? runner.state.message : null;
  const tables = db.schema.filter((t) => challenge.tables.includes(t.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link href="/challenges" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
        <ArrowLeft size={14} /> Challenges
      </Link>

      <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Question */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={DIFFICULTY_TONE[challenge.difficulty]}>{challenge.difficulty}</Badge>
              <Badge>{challenge.category}</Badge>
              <Badge tone="info">Dataset: {getDataset(challenge.dataset).name}</Badge>
              {completion && (
                <Badge tone="success">
                  <CheckCircle2 size={12} /> Completed
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              <span className="mr-2 font-mono text-sm text-slate-400">#{challenge.id}</span>
              {challenge.title}
            </h1>
            <div className="mt-2 border-l-4 border-primary-200 pl-4">
              <Markdown text={challenge.question} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">Database</h2>
            {db.status === "loading" ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Spinner /> Memuat…
              </p>
            ) : (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {tables.map((t) => (
                  <div key={t.name} className="rounded-lg border border-slate-200">
                    <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-sm font-semibold text-primary">{t.name}</p>
                    <ul className="px-3 py-1.5">
                      {t.columns.map((c) => (
                        <li key={c.name} className="flex items-center gap-1.5 py-0.5 font-mono text-xs text-slate-600">
                          {c.primaryKey ? <KeyRound size={11} className="text-amber-500" /> : c.foreignKey ? <Link2 size={11} className="text-sky-600" /> : <span className="w-[11px]" />}
                          {c.name}
                          <span className="ml-auto text-[10px] uppercase text-slate-400">{c.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/database/${challenge.dataset}`} className="mt-3 inline-block text-xs text-primary hover:underline">
              Lihat seluruh schema →
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Lightbulb size={16} className="text-amber-500" /> Hint
              </h2>
              <span className="text-xs text-slate-400">{hintsRevealed} / 3 dipakai</span>
            </div>
            <div className="mt-2 space-y-2">
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-amber-950">
                  <p className="text-xs font-semibold text-amber-700">Hint {i + 1}</p>
                  <Markdown text={hint} className="text-sm! [&_p]:my-1" />
                </div>
              ))}
            </div>
            {hintsRevealed < 3 && (
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => revealHint(id)}>
                <Lightbulb size={14} /> Tampilkan hint {hintsRevealed + 1}
              </Button>
            )}
          </Card>
        </div>

        {/* Editor + result */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-72 bg-[#1e1e1e]">
              <SqlEditor value={answer} onChange={setAnswer} onRun={run} onFormat={format} schema={db.schema} error={editorError} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={format}>
                  <Wand2 size={14} /> Format
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAnswer("")}>
                  <RotateCcw size={14} /> Clear
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={run} disabled={runner.state.kind === "running" || db.status !== "ready"}>
                  <Play size={14} /> Run
                </Button>
                <Button size="sm" variant="success" onClick={check} disabled={checking || db.status !== "ready"}>
                  {checking ? <Spinner className="h-3.5 w-3.5" /> : <CheckCircle2 size={14} />} Run & Check
                </Button>
              </div>
            </div>
          </Card>

          {outcome && (
            <Card className="p-4">
              <CheckFeedback outcome={outcome} schema={db.schema} />
              {outcome.status === "correct" && next && (
                <Link href={`/challenges/${next.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Challenge berikutnya: {next.title} <ArrowRight size={14} />
                </Link>
              )}
            </Card>
          )}

          {(!outcome || runner.state.kind !== "idle") && (
            <Card className="overflow-hidden">
              <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Query Result</p>
              <div className="max-h-[420px] overflow-auto">
                <ResultPanel
                  state={runner.state}
                  schema={db.schema}
                  pageSize={20}
                  idleText="Run untuk melihat hasil, Run & Check untuk memeriksa jawaban."
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
