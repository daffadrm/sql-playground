import type { QueryResult, SqlValue } from "./types";

export interface CompareOptions {
  /** When true, row order must match (e.g. challenges that ask for ORDER BY). */
  orderMatters: boolean;
}

export type CompareOutcome =
  | { match: true }
  | { match: false; reason: string };

function normalize(value: SqlValue): string {
  if (value === null) return "∅";
  if (typeof value === "number") {
    // 2.0 and 2 are the same answer; tolerate float noise from AVG etc.
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
  }
  if (value instanceof Uint8Array) return `blob:${value.length}`;
  // SQLite may hand back numeric text; compare it as a number.
  const trimmed = value.trim();
  if (trimmed !== "" && !Number.isNaN(Number(trimmed)) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return normalize(Number(trimmed));
  }
  return value;
}

function rowKeys(rows: SqlValue[][]): string[] {
  return rows.map((r) => r.map(normalize).join("\u0001"));
}

function sameRows(actual: SqlValue[][], expected: SqlValue[][], orderMatters: boolean): boolean {
  if (actual.length !== expected.length) return false;
  const a = rowKeys(actual);
  const e = rowKeys(expected);
  if (!orderMatters) {
    a.sort();
    e.sort();
  }
  return a.every((key, i) => key === e[i]);
}

/**
 * Picks the expected columns out of the actual result by name, so
 * `SELECT *` is accepted when the challenge only needs some columns.
 */
function projectByName(actual: QueryResult, expectedColumns: string[]): SqlValue[][] | null {
  const lower = actual.columns.map((c) => c.toLowerCase());
  const indexes = expectedColumns.map((c) => lower.indexOf(c.toLowerCase()));
  if (indexes.some((i) => i === -1)) return null;
  return actual.rows.map((row) => indexes.map((i) => row[i]));
}

/**
 * Compares by result, not by query text. Column names are ignored when the
 * column count matches (aliases are fine); extra columns are tolerated only
 * when every expected column can be found by name.
 */
export function compareResults(
  actual: QueryResult,
  expected: QueryResult,
  { orderMatters }: CompareOptions,
): CompareOutcome {
  if (actual.columns.length === expected.columns.length) {
    if (sameRows(actual.rows, expected.rows, orderMatters)) return { match: true };
  }

  const projected = projectByName(actual, expected.columns);
  if (projected && sameRows(projected, expected.rows, orderMatters)) return { match: true };

  if (actual.rows.length !== expected.rows.length) {
    return {
      match: false,
      reason: `Jumlah baris berbeda: query kamu menghasilkan ${actual.rows.length} baris, seharusnya ${expected.rows.length}.`,
    };
  }
  if (!projected && actual.columns.length !== expected.columns.length) {
    return {
      match: false,
      reason: `Jumlah kolom berbeda: query kamu menghasilkan ${actual.columns.length} kolom, seharusnya ${expected.columns.length} (${expected.columns.join(", ")}).`,
    };
  }
  if (orderMatters && sameRows(projected ?? actual.rows, expected.rows, false)) {
    return { match: false, reason: "Isi data sudah benar, tetapi urutan barisnya belum sesuai." };
  }
  return { match: false, reason: "Isi data belum sesuai dengan hasil yang diharapkan." };
}
