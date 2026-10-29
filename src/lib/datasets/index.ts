import type { DatasetId } from "@/lib/sql/types";
import { buildEcommerce } from "./ecommerce";
import { buildInventory } from "./inventory";
import { buildWarehouse } from "./warehouse";

export interface DatasetMeta {
  id: DatasetId;
  name: string;
  description: string;
  /** Parent -> child relations drawn in the Schema Viewer, in reading order. */
  relations: { from: string; to: string; via: string }[];
}

export const DATASETS: DatasetMeta[] = [
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Toko online: user, produk, kategori, order, item order, dan pembayaran.",
    relations: [
      { from: "departments", to: "users", via: "department_id" },
      { from: "users", to: "orders", via: "user_id" },
      { from: "orders", to: "order_items", via: "order_id" },
      { from: "products", to: "order_items", via: "product_id" },
      { from: "categories", to: "products", via: "category_id" },
      { from: "orders", to: "payments", via: "order_id" },
    ],
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Manajemen stok: item, supplier, gudang, stok per gudang, dan pergerakan stok.",
    relations: [
      { from: "suppliers", to: "items", via: "supplier_id" },
      { from: "items", to: "stocks", via: "item_id" },
      { from: "warehouses", to: "stocks", via: "warehouse_id" },
      { from: "items", to: "stock_movements", via: "item_id" },
      { from: "warehouses", to: "stock_movements", via: "warehouse_id" },
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse",
    description: "Operasional gudang: receiving → putaway → inventory, dan order → picking → packing → shipping.",
    relations: [
      { from: "receiving", to: "putaway", via: "receiving_id" },
      { from: "orders", to: "picking", via: "order_id" },
      { from: "orders", to: "packing", via: "order_id" },
      { from: "orders", to: "shipping", via: "order_id" },
    ],
  },
];

export function getDataset(id: DatasetId): DatasetMeta {
  return DATASETS.find((d) => d.id === id) ?? DATASETS[0];
}

export function isDatasetId(value: string): value is DatasetId {
  return DATASETS.some((d) => d.id === value);
}

const builders: Record<DatasetId, () => string> = {
  ecommerce: buildEcommerce,
  inventory: buildInventory,
  warehouse: buildWarehouse,
};

const cache = new Map<DatasetId, string>();

export function getSeedSql(id: DatasetId): string {
  let sql = cache.get(id);
  if (!sql) {
    sql = builders[id]();
    cache.set(id, sql);
  }
  return sql;
}
