"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import type { CheckOutcome } from "@/lib/sql/checker";
import type { TableInfo } from "@/lib/sql/types";
import { SqlErrorBox } from "./ResultPanel";
import { ResultTable } from "./ResultTable";

export function CheckFeedback({ outcome, schema }: { outcome: CheckOutcome; schema?: TableInfo[] }) {
  const [showExpected, setShowExpected] = useState(false);

  switch (outcome.status) {
    case "empty":
      return (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle size={16} /> Please enter a SQL query.
        </p>
      );
    case "error":
      return (
        <div className="-m-4">
          <SqlErrorBox message={outcome.message} schema={schema} />
          <p className="px-4 pb-2 text-sm text-slate-600">Please fix your query before checking.</p>
        </div>
      );
    case "correct":
      return (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-900">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 size={18} /> ✓ Correct!
          </p>
          <p className="mt-1 text-sm">Your query returned the expected result.</p>
        </div>
      );
    case "incorrect":
      return (
        <div className="space-y-2">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
            <p className="flex items-center gap-2 font-semibold text-error">
              <XCircle size={18} /> ✗ Incorrect
            </p>
            <p className="mt-1 text-sm">The result does not match the expected result.</p>
            <p className="mt-1 text-sm text-red-800">{outcome.reason}</p>
          </div>
          <button onClick={() => setShowExpected((s) => !s)} className="text-sm font-medium text-primary hover:underline">
            {showExpected ? "Sembunyikan" : "Bandingkan dengan"} hasil yang diharapkan
          </button>
          {showExpected && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Hasil kamu ({outcome.actual.rows.length} rows)
                </p>
                <ResultTable result={outcome.actual} compact pageSize={10} maxHeight="260px" />
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Diharapkan ({outcome.expected.rows.length} rows)
                </p>
                <ResultTable result={outcome.expected} compact pageSize={10} maxHeight="260px" />
              </div>
            </div>
          )}
        </div>
      );
  }
}
