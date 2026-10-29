import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "lucide-react";
import { DATASETS } from "@/lib/datasets";
import { Card, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Database · SQL Learning Playground" };

export default function DatabaseIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader title="Database" description="Dataset bawaan berisi data dummy. Pilih dataset untuk melihat tabel, kolom, relasi, dan preview data." />
      <div className="grid gap-4 md:grid-cols-3">
        {DATASETS.map((d) => (
          <Link key={d.id} href={`/database/${d.id}`}>
            <Card className="h-full p-5 transition-colors hover:border-primary-300 hover:bg-primary-50/40">
              <Database size={22} className="text-primary" />
              <p className="mt-3 font-semibold text-slate-900">{d.name}</p>
              <p className="mt-1 text-sm text-slate-500">{d.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
