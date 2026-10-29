"use client";

import { Eraser, Play, RotateCcw, Star, Wand2 } from "lucide-react";
import { useState } from "react";
import { useDataset } from "@/hooks/useDataset";
import { useSqlRunner } from "@/hooks/useSqlRunner";
import { getDataset } from "@/lib/datasets";
import { execQuery } from "@/lib/sql/engine";
import { useAppStore } from "@/lib/store/app-store";
import { toast } from "@/lib/store/toast-store";
import { DatasetSelect } from "@/components/database/DatasetSelect";
import { SchemaTree } from "@/components/database/SchemaTree";
import { ResultPanel } from "@/components/sql/ResultPanel";
import { SqlEditor, formatSql } from "@/components/sql/SqlEditor";
import { Button, Spinner } from "@/components/ui/primitives";

export function PlaygroundView() {
  const { sql, dataset } = useAppStore((s) => s.playground);
  const pageSize = useAppStore((s) => s.settings.pageSize);
  const setSql = useAppStore((s) => s.setPlaygroundSql);
  const setDataset = useAppStore((s) => s.setPlaygroundDataset);
  const addFavorite = useAppStore((s) => s.addFavorite);

  const db = useDataset(dataset);
  const runner = useSqlRunner(dataset, { mode: "live" });
  const [favoriteTitle, setFavoriteTitle] = useState<string | null>(null);

  const run = async () => {
    const outcome = await runner.run(sql);
    // DDL/DML may change tables or row counts shown in the explorer.
    if (outcome.kind === "result" && (outcome.result.rowsModified > 0 || outcome.result.statementsWithRows === 0)) {
      db.refresh();
    }
  };

  const format = () => {
    try {
      setSql(formatSql(sql));
    } catch {
      toast("Query belum bisa diformat — cek syntax-nya dulu.", "error");
    }
  };

  const preview = async (table: string) => {
    const previewSql = `SELECT * FROM ${table} LIMIT 100;`;
    try {
      runner.showResult(await execQuery(dataset, previewSql), previewSql);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const resetData = async () => {
    if (!window.confirm(`Kembalikan dataset ${getDataset(dataset).name} ke data awal? Semua perubahan INSERT/UPDATE/DELETE akan hilang.`)) return;
    await db.reset();
    runner.reset();
    toast("Data dikembalikan ke kondisi awal", "success");
  };

  const saveFavorite = () => {
    const title = favoriteTitle?.trim();
    if (!title) return;
    addFavorite(title, sql, dataset);
    setFavoriteTitle(null);
    toast("Query disimpan ke favorit", "success");
  };

  const errorMessage = runner.state.kind === "error" ? runner.state.message : null;

  return (
    <div className="flex flex-col lg:h-screen">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
        <h1 className="text-base font-semibold text-slate-900">SQL Playground</h1>
        <div className="flex flex-wrap items-center gap-2">
          {favoriteTitle !== null ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                saveFavorite();
              }}
            >
              <input
                autoFocus
                value={favoriteTitle}
                onChange={(e) => setFavoriteTitle(e.target.value)}
                placeholder="Nama query, mis. Get Product Stock"
                className="w-56 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <Button type="submit" size="sm" disabled={!favoriteTitle.trim()}>
                Simpan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFavoriteTitle(null)}>
                Batal
              </Button>
            </form>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setFavoriteTitle("")} disabled={!sql.trim()} title="Simpan ke favorit">
              <Star size={14} /> Favorit
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={format} title="Format SQL (Ctrl + Shift + F)">
            <Wand2 size={14} /> Format
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSql("")} title="Kosongkan editor">
            <Eraser size={14} /> Clear
          </Button>
          <Button size="sm" variant="secondary" onClick={resetData} title="Kembalikan data ke kondisi awal">
            <RotateCcw size={14} /> Reset Data
          </Button>
          <Button size="sm" onClick={run} disabled={runner.state.kind === "running" || db.status !== "ready"} title="Run (Ctrl + Enter)">
            {runner.state.kind === "running" ? <Spinner className="h-3.5 w-3.5" /> : <Play size={14} />} Run
            <kbd className="ml-1 hidden rounded bg-white/15 px-1 font-sans text-[10px] sm:inline">Ctrl+↵</kbd>
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-3">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Database</label>
            <DatasetSelect value={dataset} onChange={setDataset} className="w-full" />
          </div>
          <div className="max-h-64 min-h-0 flex-1 overflow-auto p-2 lg:max-h-none">
            {db.status === "loading" && (
              <p className="flex items-center gap-2 p-2 text-sm text-slate-500">
                <Spinner /> Menyiapkan database…
              </p>
            )}
            {db.status === "error" && <p className="p-2 text-sm text-error">Gagal memuat database: {db.error}</p>}
            {db.status === "ready" && <SchemaTree schema={db.schema} onPreview={preview} />}
          </div>
          <p className="hidden border-t border-slate-200 px-3 py-2 text-[11px] text-slate-400 lg:block">
            Klik tabel untuk melihat kolom, ikon mata untuk preview data.
          </p>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="h-[320px] shrink-0 bg-[#1e1e1e] lg:h-[45%]">
            <SqlEditor value={sql} onChange={setSql} onRun={run} onFormat={format} schema={db.schema} error={errorMessage} />
          </div>
          <div className="flex min-h-[300px] flex-1 flex-col border-t border-slate-200 bg-white lg:min-h-0">
            <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Query Result
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <ResultPanel state={runner.state} schema={db.schema} pageSize={pageSize} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
