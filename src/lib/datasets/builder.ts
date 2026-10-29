// Helpers for generating deterministic dummy seed data as SQL text.

export type Cell = string | number | null;

/** Mulberry32 — small seeded PRNG so every user gets identical data. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    chance: (p: number) => next() < p,
  };
}

export type Rng = ReturnType<typeof createRng>;

function literal(value: Cell): string {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replace(/'/g, "''")}'`;
}

export function insert(table: string, columns: string[], rows: Cell[][]): string {
  if (rows.length === 0) return "";
  const chunks: string[] = [];
  for (let i = 0; i < rows.length; i += 200) {
    const values = rows
      .slice(i, i + 200)
      .map((r) => `(${r.map(literal).join(", ")})`)
      .join(",\n");
    chunks.push(`INSERT INTO ${table} (${columns.join(", ")}) VALUES\n${values};`);
  }
  return chunks.join("\n");
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Random date-time in 2025, formatted as SQLite-friendly text. */
export function randomDateTime(rng: Rng, fromMonth = 1, toMonth = 12): string {
  const month = rng.int(fromMonth, toMonth);
  const day = rng.int(1, 28);
  return `2025-${pad(month)}-${pad(day)} ${pad(rng.int(7, 21))}:${pad(rng.int(0, 59))}:00`;
}

/** Adds minutes to a "YYYY-MM-DD HH:MM:SS" string. */
export function addMinutes(dateTime: string, minutes: number): string {
  const d = new Date(dateTime.replace(" ", "T") + "Z");
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export const FIRST_NAMES = [
  "Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Indah", "Joko",
  "Kartika", "Lestari", "Made", "Nadia", "Oki", "Putri", "Rizky", "Sari", "Taufik", "Utami",
  "Vina", "Wahyu", "Yusuf", "Zahra", "Agus", "Bayu", "Dimas", "Rina", "Fitri", "Hendra",
];

export const LAST_NAMES = [
  "Pratama", "Saputra", "Wijaya", "Santoso", "Kusuma", "Hidayat", "Nugroho", "Siregar",
  "Lubis", "Wibowo", "Halim", "Gunawan", "Setiawan", "Rahman", "Putra", "Sihombing",
];

export const CITIES = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan", "Makassar", "Denpasar",
];
