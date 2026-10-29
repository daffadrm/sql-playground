@AGENTS.md

# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repo ini. Sumber kebenaran requirement ada di [PRD.md](PRD.md) — baca bagian yang relevan sebelum mengerjakan fitur.

## Tentang Proyek

**SQL Learning Playground** (MVP 1.0) — aplikasi web untuk belajar SQL secara interaktif: materi, playground (mini SQL client di browser), database explorer, challenge dengan validasi otomatis, history, dan progress tracking.

**Frontend-only.** Tidak ada backend. Semua query dieksekusi di browser dan tidak boleh dikirim ke server mana pun.

## Perintah

```bash
npm run dev        # dev server di http://localhost:2909
npm run build      # production build
npm run start      # jalankan build di port 2909
npm run lint       # ESLint
npm run typecheck  # next typegen + tsc
npm run verify     # jalankan semua contoh lesson, practice, dan solusi challenge terhadap seed data
```

`predev`/`prebuild` otomatis menyalin `sql-wasm.js` + `sql-wasm.wasm` dari `node_modules/sql.js` ke `public/sqljs/` (di-gitignore). Jalankan `npm run verify` setiap kali mengubah dataset, lesson, atau challenge.

## Tech Stack

Next.js 16 (App Router, Turbopack) + TypeScript, Tailwind CSS v4 (token warna di `src/app/globals.css`), Monaco Editor via `@monaco-editor/react` (dimuat dari CDN), sql.js (SQLite WASM), Zustand, LocalStorage.

## Struktur

- `public/sqljs/engine.worker.js` — Web Worker yang menjalankan sql.js. Satu worker menyimpan semua dataset. Mode `exec` (db playground yang bisa diubah), `scratch` (salinan baru dari seed), `reset`, `schema`.
- `src/lib/sql/` — `engine.ts` (wrapper promise ke worker), `compare.ts` (validasi berbasis hasil), `checker.ts` (cek jawaban practice/challenge), `errorHints.ts` (hint error untuk pemula).
- `src/lib/datasets/` — generator seed SQL deterministik (PRNG ber-seed) untuk E-Commerce, Inventory, Warehouse. Relasi untuk Schema Viewer ada di `index.ts`.
- `src/lib/content/` — `lessons.ts` (24 materi) dan `challenges.ts` (25 challenge) sebagai data.
- `src/lib/store/app-store.ts` — satu store Zustand ter-persist (key `sql-playground`) untuk progress, history, favorit, draft, dan isi playground.
- `src/app/` — halaman: `/`, `/learn`, `/learn/[slug]`, `/playground`, `/challenges`, `/challenges/[id]`, `/database`, `/database/[dataset]`, `/history`.

## Aturan Arsitektur

- **Tidak ada backend / API route untuk eksekusi query.** SQL engine berjalan client-side di worker.
- Store di-rehydrate manual setelah mount (`skipHydration` + `AppShell`) untuk menghindari hydration mismatch. UI yang bergantung pada data tersimpan harus mengecek `useHydration`.
- Akses storage hanya lewat `safeJsonStorage` (tidak pernah throw).
- Practice dan challenge dijalankan di `scratch` (dataset segar), jadi query DML tidak mengubah db playground. Playground memakai `exec` dan punya tombol Reset Data.
- **Validasi challenge membandingkan hasil query, bukan teksnya.** Nama kolom diabaikan jika jumlah kolom sama; kolom berlebih (mis. `SELECT *`) diterima jika semua kolom yang diharapkan bisa dicocokkan berdasarkan nama. `orderMatters` hanya untuk soal yang meminta urutan. Soal DML memakai `checkSql`.
- Soal "top N" / berurutan harus punya tie-breaker yang eksplisit di pertanyaan agar hasilnya deterministik.
- Halaman dinamis me-render view dengan `key` = param agar state reset saat berpindah halaman.

## UI/UX

Primary color `#18397D` (`bg-primary`, skala `primary-50..900`). Warna status: `success`, `warning`, `error`, `info`. Desktop-first tapi responsive; editor memakai tema dark. Teks UI berbahasa Indonesia; pesan validasi mengikuti PRD (`✓ Correct!`, `✗ Incorrect`, `Please enter a SQL query.`).

## Out of Scope (MVP)

Jangan implementasikan kecuali diminta: backend, auth, leaderboard/scoring, import `.sql`/`.csv`, database simulator, AI assistant (PRD §35).
