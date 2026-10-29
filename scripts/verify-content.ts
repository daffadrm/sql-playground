// Runs every lesson example, practice solution, and challenge solution against
// the seed data with sql.js in Node. Fails if anything errors or returns nothing.
// Usage: npm run verify
import initSqlJs, { type Database } from "sql.js";
import { DATASETS, getSeedSql } from "../src/lib/datasets";
import { LESSONS } from "../src/lib/content/lessons";
import { CHALLENGES } from "../src/lib/content/challenges";
import { compareResults } from "../src/lib/sql/compare";
import type { DatasetId, QueryResult } from "../src/lib/sql/types";

async function main() {
  const SQL = await initSqlJs();
  const seeds = new Map<DatasetId, Uint8Array>();
  for (const d of DATASETS) {
    const db = new SQL.Database();
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(getSeedSql(d.id));
    const counts = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid",
    )[0].values.map(([t]) => `${t}=${db.exec(`SELECT COUNT(*) FROM "${t}"`)[0].values[0][0]}`);
    console.log(`[${d.id}] ${counts.join(" ")}`);
    seeds.set(d.id, db.export());
    db.close();
  }

  const run = (key: DatasetId, sql: string, checkSql?: string): QueryResult => {
    const db: Database = new SQL.Database(seeds.get(key)!);
    try {
      db.exec("PRAGMA foreign_keys = ON;");
      let res = db.exec(sql);
      if (checkSql) res = db.exec(checkSql);
      const last = res[res.length - 1];
      return {
        columns: last?.columns ?? [],
        rows: (last?.values ?? []) as QueryResult["rows"],
        statementsWithRows: res.length,
        rowsModified: db.getRowsModified(),
        timeMs: 0,
      };
    } finally {
      db.close();
    }
  };

  let failures = 0;
  const check = (label: string, fn: () => QueryResult, allowEmpty = false) => {
    try {
      const r = fn();
      const empty = r.rows.length === 0;
      if (empty && !allowEmpty) {
        failures++;
        console.log(`✗ ${label}: returned no rows`);
      } else {
        const preview = r.rows.slice(0, 3).map((row) => row.join(" | ")).join("  //  ");
        console.log(`✓ ${label}: ${r.rows.length} rows  [${r.columns.join(", ")}]  ${preview}`);
      }
    } catch (e) {
      failures++;
      console.log(`✗ ${label}: ${(e as Error).message}`);
    }
  };

  for (const l of LESSONS) {
    check(`lesson ${l.slug} example`, () => run(l.dataset, l.example));
    check(`lesson ${l.slug} practice`, () => run(l.dataset, l.practice.solution, l.practice.checkSql));
  }
  for (const c of CHALLENGES) {
    check(`challenge ${c.id} ${c.title}`, () => run(c.dataset, c.solution, c.checkSql));
  }

  // Result-based validation sanity checks.
  const expected = run("ecommerce", CHALLENGES.find((c) => c.id === 5)!.solution);
  const star = run("ecommerce", "SELECT * FROM products ORDER BY price DESC LIMIT 5");
  const wrong = run("ecommerce", "SELECT name, price FROM products ORDER BY price ASC LIMIT 5");
  const okStar = compareResults(star, expected, { orderMatters: true }).match;
  const okWrong = compareResults(wrong, expected, { orderMatters: true }).match;
  console.log(`compare: SELECT * accepted=${okStar}, wrong order rejected=${!okWrong}`);
  if (!okStar || okWrong) failures++;

  // Ties at a LIMIT boundary would make "top N" challenges ambiguous.
  const top = run("ecommerce", "SELECT price FROM products ORDER BY price DESC LIMIT 6").rows.map((r) => r[0]);
  if (top[4] === top[5]) {
    failures++;
    console.log("✗ challenge 5: tie at position 5");
  }

  console.log(failures === 0 ? "\nAll content OK" : `\n${failures} problem(s)`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
