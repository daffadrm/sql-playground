"use client";

import { useCallback, useRef, useState } from "react";
import { execQuery, execScratch } from "@/lib/sql/engine";
import { useAppStore } from "@/lib/store/app-store";
import type { DatasetId, QueryResult } from "@/lib/sql/types";

export type RunState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "empty" }
  | { kind: "error"; message: string; sql: string }
  | { kind: "result"; result: QueryResult; sql: string };

interface Options {
  /** "live" mutates the dataset's playground db; "scratch" runs on a fresh copy. */
  mode: "live" | "scratch";
  /** Save to query history and count toward "queries executed". */
  record?: boolean;
}

export function useSqlRunner(dataset: DatasetId, { mode, record = true }: Options) {
  const [state, setState] = useState<RunState>({ kind: "idle" });
  const recordQuery = useAppStore((s) => s.recordQuery);
  const runId = useRef(0);

  const run = useCallback(
    async (sql: string): Promise<RunState> => {
      if (!sql.trim()) {
        const next: RunState = { kind: "empty" };
        setState(next);
        return next;
      }
      const id = ++runId.current;
      setState({ kind: "running" });
      const started = performance.now();
      let next: RunState;
      try {
        const result = mode === "live" ? await execQuery(dataset, sql) : await execScratch(dataset, sql);
        next = { kind: "result", result, sql };
        if (record) {
          recordQuery({ sql, dataset, status: "success", timeMs: result.timeMs, rowCount: result.rows.length });
        }
      } catch (e) {
        const message = (e as Error).message;
        next = { kind: "error", message, sql };
        if (record) {
          recordQuery({ sql, dataset, status: "error", timeMs: performance.now() - started, rowCount: null, error: message });
        }
      }
      // Ignore results from a run that was superseded by a newer one.
      if (id === runId.current) setState(next);
      return next;
    },
    [dataset, mode, record, recordQuery],
  );

  const showResult = useCallback((result: QueryResult, sql: string) => {
    runId.current++;
    setState({ kind: "result", result, sql });
  }, []);

  const reset = useCallback(() => setState({ kind: "idle" }), []);

  return { state, run, showResult, reset };
}
