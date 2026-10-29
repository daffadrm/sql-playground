"use client";

import { getSeedSql } from "@/lib/datasets";
import type { DatasetId, QueryResult, TableInfo } from "./types";

// Thin promise wrapper around public/sqljs/engine.worker.js.
// One worker holds every dataset; each dataset is seeded at most once.

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();
const loading = new Map<DatasetId, Promise<TableInfo[]>>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/sqljs/engine.worker.js");
  worker.onmessage = (event: MessageEvent) => {
    const { id, ok, data, error } = event.data;
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (ok) p.resolve(data);
    else p.reject(new Error(error));
  };
  worker.onerror = (event) => {
    const err = new Error(event.message || "SQL engine gagal dimuat.");
    for (const p of pending.values()) p.reject(err);
    pending.clear();
  };
  return worker;
}

function call<T>(type: string, payload: Record<string, unknown>): Promise<T> {
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    getWorker().postMessage({ id, type, ...payload });
  });
}

/** Seeds the dataset (once) and resolves with its schema. */
export function loadDataset(key: DatasetId): Promise<TableInfo[]> {
  let p = loading.get(key);
  if (!p) {
    p = call<TableInfo[]>("load", { key, seedSql: getSeedSql(key) });
    p.catch(() => loading.delete(key));
    loading.set(key, p);
  }
  return p;
}

export async function getSchema(key: DatasetId): Promise<TableInfo[]> {
  await loadDataset(key);
  return call<TableInfo[]>("schema", { key });
}

/** Runs SQL against the persistent (mutable) in-memory database of a dataset. */
export async function execQuery(key: DatasetId, sql: string): Promise<QueryResult> {
  await loadDataset(key);
  return call<QueryResult>("exec", { key, sql });
}

/** Runs SQL against a throwaway copy of the seed data. */
export async function execScratch(
  key: DatasetId,
  sql: string,
  checkSql?: string,
): Promise<QueryResult> {
  await loadDataset(key);
  return call<QueryResult>("scratch", { key, sql, checkSql });
}

/** Restores the dataset to its original seed data. */
export async function resetDataset(key: DatasetId): Promise<TableInfo[]> {
  await loadDataset(key);
  return call<TableInfo[]>("reset", { key });
}
