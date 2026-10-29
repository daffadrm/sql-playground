"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ClipboardCopy, Copy } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { copyText } from "@/lib/store/toast-store";
import { formatMs, formatNumber } from "@/lib/format";
import type { QueryResult, SqlValue } from "@/lib/sql/types";
import { Button } from "@/components/ui/primitives";

function cellText(v: SqlValue): string {
  if (v === null) return "NULL";
  if (v instanceof Uint8Array) return `<blob ${v.length} bytes>`;
  return String(v);
}

function compareValues(a: SqlValue, b: SqlValue): number {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "id", { numeric: true });
}

const toTsv = (columns: string[], rows: SqlValue[][]) =>
  [columns.join("\t"), ...rows.map((r) => r.map(cellText).join("\t"))].join("\n");

interface Props {
  result: QueryResult;
  pageSize?: number;
  /** Compact mode hides the toolbar (used for small previews). */
  compact?: boolean;
  maxHeight?: string;
}

export function ResultTable({ result, pageSize = 50, compact = false, maxHeight = "100%" }: Props) {
  const { columns, rows } = result;
  const [sort, setSort] = useState<{ col: number; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);
  const [widths, setWidths] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const resizing = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => compareValues(a[sort.col], b[sort.col]) * (sort.dir === "asc" ? 1 : -1));
    return copy;
  }, [rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  const toggleSort = (col: number) => {
    setPage(0);
    setSort((s) => (!s || s.col !== col ? { col, dir: "asc" } : s.dir === "asc" ? { col, dir: "desc" } : null));
  };

  const startResize = (e: React.MouseEvent, col: number) => {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.currentTarget as HTMLElement).parentElement!;
    resizing.current = { col, startX: e.clientX, startW: th.getBoundingClientRect().width };
    const onMove = (ev: MouseEvent) => {
      const r = resizing.current;
      if (!r) return;
      setWidths((w) => ({ ...w, [r.col]: Math.max(60, r.startW + ev.clientX - r.startX) }));
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const selectedRow = selected ? sorted[selected.row] : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Result: <strong className="text-slate-700">{formatNumber(rows.length)} rows</strong>
            </span>
            <span>
              Execution time: <strong className="text-slate-700">{formatMs(result.timeMs)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" disabled={!selected} onClick={() => selectedRow && copyText(cellText(selectedRow[selected!.col]), "Cell disalin")}>
              <Copy size={13} /> Cell
            </Button>
            <Button size="sm" variant="ghost" disabled={!selected} onClick={() => selectedRow && copyText(selectedRow.map(cellText).join("\t"), "Row disalin")}>
              <Copy size={13} /> Row
            </Button>
            <Button size="sm" variant="ghost" onClick={() => copyText(toTsv(columns, sorted), "Result disalin (TSV)")}>
              <ClipboardCopy size={13} /> Result
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto" style={{ maxHeight }}>
        <table className="border-separate border-spacing-0 text-left font-mono text-[13px]" style={{ tableLayout: "fixed" }}>
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className="w-12 border-b border-r border-slate-200 px-2 py-2 text-right text-xs font-normal text-slate-400">#</th>
              {columns.map((c, i) => (
                <th
                  key={i}
                  onClick={() => toggleSort(i)}
                  className="group relative cursor-pointer select-none border-b border-r border-slate-200 px-3 py-2 font-sans text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  style={{ width: widths[i] ?? 160, minWidth: widths[i] ?? 160, maxWidth: widths[i] ?? 160 }}
                  title="Klik untuk mengurutkan"
                >
                  <span className="flex items-center gap-1 truncate">
                    {c}
                    {sort?.col === i && (sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </span>
                  <span
                    onMouseDown={(e) => startResize(e, i)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary-300"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, r) => {
              const rowIndex = start + r;
              return (
                <tr key={rowIndex} className="hover:bg-primary-50/50">
                  <td
                    onClick={() => copyText(row.map(cellText).join("\t"), "Row disalin")}
                    title="Klik untuk menyalin row"
                    className="cursor-copy border-b border-r border-slate-100 px-2 py-1.5 text-right text-xs text-slate-400 hover:text-primary"
                  >
                    {rowIndex + 1}
                  </td>
                  {row.map((v, c) => {
                    const isSelected = selected?.row === rowIndex && selected.col === c;
                    return (
                      <td
                        key={c}
                        onClick={() => setSelected({ row: rowIndex, col: c })}
                        onDoubleClick={() => copyText(cellText(v), "Cell disalin")}
                        title={cellText(v)}
                        className={`truncate border-b border-r border-slate-100 px-3 py-1.5 ${
                          isSelected ? "bg-primary-100 outline outline-1 -outline-offset-1 outline-primary-400" : ""
                        } ${v === null ? "italic text-slate-400" : typeof v === "number" ? "text-right text-slate-800" : "text-slate-800"}`}
                        style={{ maxWidth: widths[c] ?? 160 }}
                      >
                        {cellText(v)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-1.5 text-xs text-slate-500">
          <span>
            {formatNumber(start + 1)}–{formatNumber(Math.min(start + pageSize, sorted.length))} dari {formatNumber(sorted.length)}
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Halaman sebelumnya">
              <ChevronLeft size={14} />
            </Button>
            <span>
              {safePage + 1} / {pageCount}
            </span>
            <Button size="sm" variant="ghost" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label="Halaman berikutnya">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
