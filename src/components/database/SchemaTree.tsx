"use client";

import { ChevronRight, Eye, KeyRound, Link2, Table2 } from "lucide-react";
import { useState } from "react";
import type { TableInfo } from "@/lib/sql/types";

interface Props {
  schema: TableInfo[];
  onPreview?: (table: string) => void;
  onInsert?: (text: string) => void;
}

/** Expandable table → column tree with types, PK and FK markers. */
export function SchemaTree({ schema, onPreview, onInsert }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ul className="text-sm">
      {schema.map((t) => {
        const expanded = open[t.name] ?? false;
        return (
          <li key={t.name}>
            <div className="group flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-slate-100">
              <button
                onClick={() => setOpen((o) => ({ ...o, [t.name]: !expanded }))}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                aria-expanded={expanded}
              >
                <ChevronRight size={14} className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
                <Table2 size={14} className="shrink-0 text-primary-400" />
                <span
                  className="truncate font-mono text-[13px] text-slate-800"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onInsert?.(t.name);
                  }}
                >
                  {t.name}
                </span>
                <span className="ml-auto shrink-0 text-[11px] text-slate-400">{t.rowCount}</span>
              </button>
              {onPreview && (
                <button
                  onClick={() => onPreview(t.name)}
                  title={`Preview data ${t.name}`}
                  aria-label={`Preview data ${t.name}`}
                  className="shrink-0 rounded p-0.5 text-slate-400 opacity-0 hover:bg-white hover:text-primary group-hover:opacity-100 focus:opacity-100"
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
            {expanded && (
              <ul className="mb-1 ml-5 border-l border-slate-200 pl-2">
                {t.columns.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-slate-50"
                    title={c.foreignKey ? `FK → ${c.foreignKey.table}.${c.foreignKey.column}` : undefined}
                  >
                    {c.primaryKey ? (
                      <KeyRound size={12} className="shrink-0 text-amber-500" />
                    ) : c.foreignKey ? (
                      <Link2 size={12} className="shrink-0 text-sky-600" />
                    ) : (
                      <span className="w-3 shrink-0" />
                    )}
                    <button className="truncate font-mono text-[12px] text-slate-700 hover:text-primary" onClick={() => onInsert?.(c.name)} disabled={!onInsert}>
                      {c.name}
                    </button>
                    <span className="ml-auto shrink-0 font-mono text-[10px] uppercase text-slate-400">{c.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
