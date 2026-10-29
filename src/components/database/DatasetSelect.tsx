"use client";

import { DATASETS, isDatasetId } from "@/lib/datasets";
import type { DatasetId } from "@/lib/sql/types";

export function DatasetSelect({ value, onChange, className = "" }: { value: DatasetId; onChange: (id: DatasetId) => void; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => isDatasetId(e.target.value) && onChange(e.target.value)}
      aria-label="Pilih dataset"
      className={`rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-primary focus:outline-none ${className}`}
    >
      {DATASETS.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );
}
