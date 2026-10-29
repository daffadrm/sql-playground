"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, KeyRound, Link2, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { useDataset } from "@/hooks/useDataset";
import { getDataset } from "@/lib/datasets";
import { execQuery } from "@/lib/sql/engine";
import type { DatasetId, QueryResult } from "@/lib/sql/types";
import { useAppStore } from "@/lib/store/app-store";
import { toast } from "@/lib/store/toast-store";
import { SchemaDiagram } from "@/components/database/SchemaDiagram";
import { ResultTable } from "@/components/sql/ResultTable";
import { Badge, Button, Card, PageHeader, Spinner } from "@/components/ui/primitives";

export function DatasetView({ dataset }: { dataset: DatasetId }) {
  const meta = getDataset(dataset);
  const db = useDataset(dataset);
  const router = useRouter();
  const openInPlayground = useAppStore((s) => s.openInPlayground);
  const [previews, setPreviews] = useState<Record<string, QueryResult | "loading">>({});

  const closePreview = (table: string) =>
    setPreviews((p) => {
      const next = { ...p };
      delete next[table];
      return next;
    });

  const togglePreview = async (table: string) => {
    if (previews[table]) {
      closePreview(table);
      return;
    }
    setPreviews((p) => ({ ...p, [table]: "loading" }));
    try {
      const result = await execQuery(dataset, `SELECT * FROM ${table} LIMIT 20;`);
      setPreviews((p) => ({ ...p, [table]: result }));
    } catch (e) {
      toast((e as Error).message, "error");
      closePreview(table);
    }
  };

  const queryTable = (table: string) => {
    openInPlayground(`SELECT *\nFROM ${table}\nLIMIT 50;`, dataset);
    router.push("/playground");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <Link href="/database" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
          <ArrowLeft size={14} /> Database
        </Link>
        <div className="mt-3">
          <PageHeader title={meta.name} description={meta.description} />
        </div>
      </div>

      {db.status === "loading" && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Menyiapkan database…
        </p>
      )}
      {db.status === "error" && <p className="text-sm text-error">Gagal memuat database: {db.error}</p>}

      {db.status === "ready" && (
        <>
          <section>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Schema Viewer</h2>
            <p className="mb-3 text-sm text-slate-500">Relasi antar tabel. Kolom foreign key di tabel anak menunjuk ke primary key tabel induk — inilah kolom yang dipakai saat JOIN.</p>
            <SchemaDiagram dataset={meta} schema={db.schema} />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Tabel</h2>
            {db.schema.map((t) => {
              const preview = previews[t.name];
              return (
                <Card key={t.name} className="scroll-mt-20 overflow-hidden">
                  <div id={`table-${t.name}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-base font-semibold text-primary">{t.name}</h3>
                      <Badge>{t.rowCount} rows</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => togglePreview(t.name)}>
                        <Eye size={14} /> {preview ? "Tutup preview" : "Preview data"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => queryTable(t.name)}>
                        <SquareTerminal size={14} /> Query
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs text-slate-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">Column</th>
                          <th className="px-4 py-2 font-medium">Type</th>
                          <th className="px-4 py-2 font-medium">Key</th>
                          <th className="px-4 py-2 font-medium">Null</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.columns.map((c) => (
                          <tr key={c.name} className="border-t border-slate-100">
                            <td className="px-4 py-1.5 font-mono text-[13px] text-slate-800">{c.name}</td>
                            <td className="px-4 py-1.5 font-mono text-xs uppercase text-slate-500">{c.type}</td>
                            <td className="px-4 py-1.5">
                              {c.primaryKey && (
                                <Badge tone="warning">
                                  <KeyRound size={11} /> PK
                                </Badge>
                              )}
                              {c.foreignKey && (
                                <a href={`#table-${c.foreignKey.table}`}>
                                  <Badge tone="info">
                                    <Link2 size={11} /> FK → {c.foreignKey.table}.{c.foreignKey.column}
                                  </Badge>
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-1.5 text-xs text-slate-500">{c.notNull || c.primaryKey ? "NOT NULL" : "NULL"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview && (
                    <div className="border-t border-slate-200">
                      {preview === "loading" ? (
                        <p className="flex items-center gap-2 p-4 text-sm text-slate-500">
                          <Spinner /> Memuat data…
                        </p>
                      ) : (
                        <ResultTable result={preview} compact pageSize={20} maxHeight="360px" />
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
