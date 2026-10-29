import { ArrowDown } from "lucide-react";
import type { DatasetMeta } from "@/lib/datasets";
import type { TableInfo } from "@/lib/sql/types";

/**
 * Shows each relation as parent → (fk column) → child, matching the PRD's
 * schema viewer. Helps learners see which columns to JOIN on.
 */
export function SchemaDiagram({ dataset, schema }: { dataset: DatasetMeta; schema: TableInfo[] }) {
  const rowCount = (name: string) => schema.find((t) => t.name === name)?.rowCount;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {dataset.relations.map((r) => (
        <div key={`${r.from}-${r.to}-${r.via}`} className="flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 p-3">
          <TableChip name={r.from} rows={rowCount(r.from)} />
          <div className="my-1 flex flex-col items-center text-slate-400">
            <span className="h-2 w-px bg-slate-300" />
            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-sky-700 ring-1 ring-slate-200">
              {r.to}.{r.via} = {r.from}.id
            </span>
            <ArrowDown size={14} />
          </div>
          <TableChip name={r.to} rows={rowCount(r.to)} />
        </div>
      ))}
    </div>
  );
}

function TableChip({ name, rows }: { name: string; rows?: number }) {
  return (
    <a href={`#table-${name}`} className="rounded-md bg-primary px-3 py-1.5 font-mono text-sm text-white hover:bg-primary-700">
      {name}
      {rows !== undefined && <span className="ml-2 text-xs text-primary-200">{rows}</span>}
    </a>
  );
}
