import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="font-mono text-sm text-slate-400">SELECT * FROM pages WHERE url = ?; -- 0 rows</p>
      <h1 className="text-2xl font-semibold text-slate-900">Halaman tidak ditemukan</h1>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
