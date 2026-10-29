"use client";

import { useCallback, useEffect, useState } from "react";
import { getSchema, loadDataset, resetDataset } from "@/lib/sql/engine";
import type { DatasetId, TableInfo } from "@/lib/sql/types";

type Status = "loading" | "ready" | "error";

/** Loads a dataset into the SQL engine and exposes its schema. */
export function useDataset(dataset: DatasetId) {
  const [state, setState] = useState<{ dataset: DatasetId; status: Status; schema: TableInfo[]; error: string | null }>({
    dataset,
    status: "loading",
    schema: [],
    error: null,
  });

  // Switching datasets shows the loading state until the new schema arrives.
  if (state.dataset !== dataset) {
    setState({ dataset, status: "loading", schema: [], error: null });
  }

  useEffect(() => {
    let cancelled = false;
    loadDataset(dataset)
      .then(() => getSchema(dataset))
      .then((schema) => !cancelled && setState({ dataset, status: "ready", schema, error: null }))
      .catch((e: Error) => !cancelled && setState({ dataset, status: "error", schema: [], error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [dataset]);

  /** Re-reads the schema, e.g. after CREATE TABLE / INSERT changed row counts. */
  const refresh = useCallback(async () => {
    const schema = await getSchema(dataset);
    setState({ dataset, status: "ready", schema, error: null });
  }, [dataset]);

  const reset = useCallback(async () => {
    const schema = await resetDataset(dataset);
    setState({ dataset, status: "ready", schema, error: null });
  }, [dataset]);

  return { ...state, refresh, reset };
}
