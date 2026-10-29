export type SqlValue = string | number | null | Uint8Array;

export interface QueryResult {
  columns: string[];
  rows: SqlValue[][];
  /** Number of executed statements that returned rows. 0 means no result set. */
  statementsWithRows: number;
  rowsModified: number;
  timeMs: number;
}

export interface ForeignKey {
  table: string;
  column: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  primaryKey: boolean;
  foreignKey: ForeignKey | null;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export type DatasetId = "ecommerce" | "inventory" | "warehouse";
