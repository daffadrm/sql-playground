"use client";

import { AlertTriangle, CheckCircle2, Lightbulb, Table2, XCircle } from "lucide-react";
import { hintForError } from "@/lib/sql/errorHints";
import { formatMs } from "@/lib/format";
import type { QueryResult, TableInfo } from "@/lib/sql/types";
import type { RunState } from "@/hooks/useSqlRunner";
import { CodeBlock } from "@/components/ui/Markdown";
import { EmptyState, Spinner } from "@/components/ui/primitives";
import { ResultTable } from "./ResultTable";

const resultKeys = new WeakMap<QueryResult, number>();
let nextResultKey = 1;
function resultKey(result: QueryResult): number {
  let key = resultKeys.get(result);
  if (!key) {
    key = nextResultKey++;
    resultKeys.set(result, key);
  }
  return key;
}

export function SqlErrorBox({ message, schema }: { message: string; schema?: TableInfo[] }) {
  const hint = hintForError(message, schema);
  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-error">
          <XCircle size={16} /> SQL Error
        </p>
        <p className="mt-1 font-mono text-[13px] text-red-800">{message}</p>
      </div>
      {hint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-semibold">
            <Lightbulb size={16} /> Hint
          </p>
          <p className="mt-1">{hint.message}</p>
          {hint.example && (
            <>
              <p className="mt-2 text-xs">Contoh:</p>
              <CodeBlock code={hint.example} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ResultPanel({
  state,
  schema,
  pageSize,
  idleText = "Tulis query lalu tekan Run (Ctrl + Enter).",
}: {
  state: RunState;
  schema?: TableInfo[];
  pageSize?: number;
  idleText?: string;
}) {
  switch (state.kind) {
    case "idle":
      return <EmptyState icon={<Table2 size={36} />} title="Belum ada hasil" description={idleText} />;
    case "running":
      return (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
          <Spinner /> Menjalankan query…
        </div>
      );
    case "empty":
      return (
        <div className="p-4">
          <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle size={16} /> Please enter a SQL query.
          </p>
        </div>
      );
    case "error":
      return <SqlErrorBox message={state.message} schema={schema} />;
    case "result": {
      const { result } = state;
      if (result.statementsWithRows === 0) {
        return (
          <div className="p-4">
            <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
              <CheckCircle2 size={16} className="text-success" />
              Query berhasil dijalankan. {result.rowsModified} baris terpengaruh · {formatMs(result.timeMs)}
            </p>
          </div>
        );
      }
      // Fresh table state (page, sort, widths) for every new result.
      return <ResultTable key={resultKey(result)} result={result} pageSize={pageSize} />;
    }
  }
}
