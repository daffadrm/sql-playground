"use client";

import { compareResults } from "./compare";
import { execScratch } from "./engine";
import type { DatasetId, QueryResult } from "./types";

export type CheckOutcome =
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "correct"; actual: QueryResult; output: QueryResult }
  | { status: "incorrect"; reason: string; actual: QueryResult; expected: QueryResult; output: QueryResult };

interface CheckInput {
  dataset: DatasetId;
  userSql: string;
  solution: string;
  checkSql?: string;
  orderMatters?: boolean;
}

/**
 * Runs the user's SQL and the reference solution on separate fresh copies of
 * the dataset, then compares the results (not the query text).
 */
export async function checkAnswer({ dataset, userSql, solution, checkSql, orderMatters = false }: CheckInput): Promise<CheckOutcome> {
  if (!userSql.trim()) return { status: "empty" };
  let actual: QueryResult;
  try {
    actual = await execScratch(dataset, userSql, checkSql);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const expected = await execScratch(dataset, solution, checkSql);
  // What a plain Run would show; with checkSql, `actual` is the check query's result instead.
  const output = checkSql ? await execScratch(dataset, userSql) : actual;
  if (!checkSql && actual.statementsWithRows === 0) {
    return { status: "incorrect", reason: "Query kamu tidak menghasilkan tabel hasil. Pastikan ada perintah SELECT.", actual, expected, output };
  }
  const outcome = compareResults(actual, expected, { orderMatters });
  return outcome.match
    ? { status: "correct", actual, output }
    : { status: "incorrect", reason: outcome.reason, actual, expected, output };
}
