import type { TableInfo } from "./types";

export interface ErrorHint {
  message: string;
  example?: string;
}

/** Turns a raw SQLite error into a short hint for beginners. */
export function hintForError(error: string, schema: TableInfo[] = []): ErrorHint | null {
  const e = error.toLowerCase();
  const tables = schema.map((t) => t.name);

  let m = /no such table: (\S+)/i.exec(error);
  if (m) {
    return {
      message: `Tabel "${m[1]}" tidak ada di dataset ini.${tables.length ? ` Tabel yang tersedia: ${tables.join(", ")}.` : ""}`,
    };
  }

  m = /no such column: (\S+)/i.exec(error);
  if (m) {
    const col = m[1].split(".").pop()!.toLowerCase();
    const owners = schema.filter((t) => t.columns.some((c) => c.name.toLowerCase() === col)).map((t) => t.name);
    return {
      message: owners.length
        ? `Kolom "${m[1]}" tidak dikenali di sini. Kolom ${col} ada di tabel: ${owners.join(", ")}. Pastikan tabel tersebut ada di FROM/JOIN dan alias-nya benar.`
        : `Kolom "${m[1]}" tidak ada. Cek nama kolom di Database Explorer. Kalau maksudnya teks, gunakan tanda kutip tunggal: 'teks'.`,
    };
  }

  m = /ambiguous column name: (\S+)/i.exec(error);
  if (m) {
    return {
      message: `Kolom "${m[1]}" ada di lebih dari satu tabel pada JOIN. Tambahkan nama tabel atau alias di depannya.`,
      example: `SELECT u.id, o.id\nFROM users u\nJOIN orders o ON o.user_id = u.id`,
    };
  }

  m = /near "(.+?)": syntax error/i.exec(error);
  if (m) {
    const token = m[1].toUpperCase();
    if (token === "WHERE") return { message: "Ada yang salah di sekitar WHERE. Cek bagian sebelum WHERE (FROM sudah ditulis?) dan pastikan WHERE diikuti kondisi.", example: "WHERE price > 10000" };
    if (token === "FROM") return { message: "SELECT membutuhkan daftar kolom sebelum FROM. Gunakan * untuk semua kolom.", example: "SELECT * FROM products" };
    if (token === "GROUP" || token === "ORDER") return { message: `Urutan klausa: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. Cek posisi ${token} BY.` };
    if (token === ",") return { message: "Ada koma yang tidak pada tempatnya. Biasanya koma berlebih setelah kolom terakhir sebelum FROM." };
    if (token === ")") return { message: "Tanda kurung tidak seimbang atau isi di dalam kurung belum lengkap." };
    return { message: `SQL tidak dapat membaca query di sekitar "${m[1]}". Cek ejaan keyword, koma, dan tanda kutip di dekatnya.` };
  }

  if (e.includes("incomplete input")) {
    return { message: "Query belum lengkap. Mungkin ada kondisi WHERE, tanda kurung, atau tanda kutip yang belum ditutup.", example: "WHERE price > 10000" };
  }
  if (e.includes("misuse of aggregate")) {
    return { message: "Fungsi agregat (COUNT, SUM, AVG, ...) tidak boleh dipakai di WHERE. Gunakan HAVING untuk memfilter hasil agregasi.", example: "GROUP BY category_id\nHAVING COUNT(*) > 5" };
  }
  if (e.includes("a group by clause is required before having")) {
    return { message: "HAVING dipakai bersama GROUP BY. Tambahkan GROUP BY sebelum HAVING." };
  }
  if (e.includes("unique constraint failed")) {
    return { message: "Data yang kamu masukkan melanggar aturan UNIQUE (nilai sudah ada). Gunakan nilai lain." };
  }
  if (e.includes("not null constraint failed")) {
    return { message: "Ada kolom wajib (NOT NULL) yang belum diisi. Lihat struktur tabel di Database Explorer." };
  }
  if (e.includes("foreign key constraint failed")) {
    return { message: "Nilai foreign key tidak ditemukan di tabel induknya, atau data masih direferensikan oleh tabel lain." };
  }
  if (e.includes("selects to the left and right of union")) {
    return { message: "Query di kiri dan kanan UNION harus memiliki jumlah kolom yang sama." };
  }
  if (e.includes("no such function")) {
    return { message: "Fungsi tersebut tidak tersedia di SQLite. Contoh fungsi yang ada: COUNT, SUM, AVG, MIN, MAX, ROUND, UPPER, LOWER, LENGTH, SUBSTR, COALESCE." };
  }
  return null;
}

/** Tries to find the token from a "near X" error to highlight it in the editor. */
export function errorToken(error: string): string | null {
  const m = /near "(.+?)"/i.exec(error) ?? /no such (?:column|table): (\S+)/i.exec(error);
  return m ? m[1] : null;
}
