"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, History as HistoryIcon, Star, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { getDataset } from "@/lib/datasets";
import { formatMs, relativeTime } from "@/lib/format";
import type { DatasetId } from "@/lib/sql/types";
import { useAppStore, useHydration } from "@/lib/store/app-store";
import { copyText } from "@/lib/store/toast-store";
import { Badge, Button, Card, EmptyState, PageHeader, Spinner } from "@/components/ui/primitives";

export function HistoryView() {
  const router = useRouter();
  const hydrated = useHydration((s) => s.hydrated);
  const history = useAppStore((s) => s.history);
  const favorites = useAppStore((s) => s.favorites);
  const { removeHistory, clearHistory, removeFavorite, openInPlayground, addFavorite } = useAppStore.getState();
  const [tab, setTab] = useState<"history" | "favorites">("history");

  const open = (sql: string, dataset: DatasetId) => {
    openInPlayground(sql, dataset);
    router.push("/playground");
  };

  const tabClass = (active: boolean) =>
    `flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${
      active ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Query History"
        description="Query yang pernah dijalankan dan query favorit tersimpan di browser ini. Klik query untuk membukanya kembali di Playground."
        actions={
          tab === "history" &&
          history.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => window.confirm("Hapus semua riwayat query?") && clearHistory()}
            >
              <Trash2 size={14} /> Hapus semua
            </Button>
          )
        }
      />

      <div className="flex border-b border-slate-200">
        <button className={tabClass(tab === "history")} onClick={() => setTab("history")}>
          <HistoryIcon size={15} /> History <Badge>{history.length}</Badge>
        </button>
        <button className={tabClass(tab === "favorites")} onClick={() => setTab("favorites")}>
          <Star size={15} /> Favorites <Badge>{favorites.length}</Badge>
        </button>
      </div>

      {!hydrated ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Memuat…
        </p>
      ) : tab === "history" ? (
        history.length === 0 ? (
          <Card>
            <EmptyState icon={<HistoryIcon size={36} />} title="Belum ada riwayat" description="Query yang kamu jalankan di Playground, materi, dan challenge akan muncul di sini." />
          </Card>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id}>
                <Card className="group flex items-start gap-3 p-3 hover:border-primary-300">
                  {h.status === "success" ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-label="Success" />
                  ) : (
                    <XCircle size={18} className="mt-0.5 shrink-0 text-error" aria-label="Error" />
                  )}
                  <button className="min-w-0 flex-1 text-left" onClick={() => open(h.sql, h.dataset)}>
                    <pre className="line-clamp-3 whitespace-pre-wrap break-words font-mono text-[13px] text-slate-800">{h.sql}</pre>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className={h.status === "success" ? "text-success" : "text-error"}>{h.status === "success" ? "✓ Success" : "✗ Error"}</span>
                      <span>{formatMs(h.timeMs)}</span>
                      {h.rowCount !== null && <span>{h.rowCount} rows</span>}
                      <span>{relativeTime(h.at)}</span>
                      <Badge tone="info">{getDataset(h.dataset).name}</Badge>
                    </p>
                    {h.error && <p className="mt-1 truncate font-mono text-xs text-error">{h.error}</p>}
                  </button>
                  <div className="flex shrink-0 gap-0.5 opacity-60 group-hover:opacity-100">
                    <Button size="sm" variant="ghost" title="Salin" aria-label="Salin query" onClick={() => copyText(h.sql, "Query disalin")}>
                      <Copy size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" title="Simpan ke favorit" aria-label="Simpan ke favorit" onClick={() => addFavorite(h.sql.split("\n")[0].slice(0, 60), h.sql, h.dataset)}>
                      <Star size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" title="Hapus" aria-label="Hapus dari history" onClick={() => removeHistory(h.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : favorites.length === 0 ? (
        <Card>
          <EmptyState icon={<Star size={36} />} title="Belum ada query favorit" description="Simpan query dari Playground dengan tombol Favorit, atau dari ikon bintang di History." />
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {favorites.map((f) => (
            <li key={f.id}>
              <Card className="group flex h-full flex-col p-4 hover:border-primary-300">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 font-medium text-slate-900">
                    <Star size={15} className="fill-amber-400 text-amber-400" /> {f.title}
                  </p>
                  <Button size="sm" variant="ghost" aria-label="Hapus favorit" onClick={() => removeFavorite(f.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <button onClick={() => open(f.sql, f.dataset)} className="mt-2 flex-1 text-left">
                  <pre className="line-clamp-6 whitespace-pre-wrap rounded-lg bg-slate-900 px-3 py-2 font-mono text-[12px] text-slate-100">{f.sql}</pre>
                </button>
                <p className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <Badge tone="info">{getDataset(f.dataset).name}</Badge>
                  {relativeTime(f.createdAt)}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
