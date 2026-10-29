import { CITIES, createRng, insert, randomDateTime, type Cell } from "./builder";

const SCHEMA = `
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE warehouses (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_cost INTEGER NOT NULL,
  reorder_level INTEGER NOT NULL,
  supplier_id INTEGER REFERENCES suppliers(id)
);

CREATE TABLE stocks (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  quantity INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (item_id, warehouse_id)
);

CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUST')),
  quantity INTEGER NOT NULL,
  reference TEXT,
  moved_at TEXT NOT NULL
);
`;

const SUPPLIERS = [
  "PT Sumber Makmur", "CV Jaya Abadi", "PT Maju Bersama", "PT Sinar Terang", "CV Berkah Sentosa",
  "PT Mitra Logistik", "PT Nusantara Supply", "CV Karya Mandiri", "PT Global Teknik", "PT Indo Kemasan",
  "CV Sejahtera", "PT Prima Niaga", "PT Cahaya Baru", "CV Tunas Muda", "PT Bintang Timur",
];

const ITEM_TYPES: [string, string, [number, number]][] = [
  ["Kardus", "pcs", [1500, 8000]],
  ["Lakban", "roll", [6000, 15000]],
  ["Palet Kayu", "pcs", [60000, 150000]],
  ["Bubble Wrap", "roll", [40000, 120000]],
  ["Label Barcode", "pack", [20000, 60000]],
  ["Sarung Tangan", "pasang", [5000, 25000]],
  ["Stretch Film", "roll", [70000, 180000]],
  ["Kabel Ties", "pack", [8000, 30000]],
  ["Baut", "box", [15000, 60000]],
  ["Oli Mesin", "liter", [45000, 120000]],
];
const SIZES = ["S", "M", "L", "XL", "Kecil", "Sedang", "Besar", "Standar"];

export function buildInventory(): string {
  const rng = createRng(777);
  const parts: string[] = [SCHEMA];

  parts.push(
    insert(
      "suppliers",
      ["id", "name", "city", "phone"],
      SUPPLIERS.map((name, i) => [i + 1, name, rng.pick(CITIES), i % 5 === 4 ? null : `08${rng.int(1000000000, 1999999999)}`]),
    ),
  );

  const warehouses: Cell[][] = [
    [1, "WH-JKT", "Gudang Jakarta", "Jakarta", 50000],
    [2, "WH-BDG", "Gudang Bandung", "Bandung", 20000],
    [3, "WH-SBY", "Gudang Surabaya", "Surabaya", 35000],
    [4, "WH-MDN", "Gudang Medan", "Medan", 15000],
    [5, "WH-MKS", "Gudang Makassar", "Makassar", 10000],
  ];
  parts.push(insert("warehouses", ["id", "code", "name", "city", "capacity"], warehouses));

  const items: Cell[][] = [];
  const usedNames = new Set<string>();
  for (let id = 1; id <= 80; id++) {
    const [type, unit, [min, max]] = ITEM_TYPES[(id - 1) % ITEM_TYPES.length];
    let name = "";
    do {
      name = `${type} ${rng.pick(SIZES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    items.push([
      id,
      `SKU-${String(1000 + id)}`,
      name,
      unit,
      Math.round(rng.int(min, max) / 100) * 100,
      rng.pick([10, 20, 25, 50, 100]),
      id % 16 === 0 ? null : rng.int(1, 15),
    ]);
  }
  parts.push(insert("items", ["id", "sku", "name", "unit", "unit_cost", "reorder_level", "supplier_id"], items));

  const stocks: Cell[][] = [];
  for (let itemId = 1; itemId <= 80; itemId++) {
    for (let wh = 1; wh <= 5; wh++) {
      if (!rng.chance(0.6)) continue;
      const qty = rng.chance(0.15) ? rng.int(0, 15) : rng.int(20, 800);
      stocks.push([stocks.length + 1, itemId, wh, qty, randomDateTime(rng, 9, 12)]);
    }
  }
  parts.push(insert("stocks", ["id", "item_id", "warehouse_id", "quantity", "updated_at"], stocks));

  const movements: Cell[][] = [];
  for (let id = 1; id <= 300; id++) {
    const stock = rng.pick(stocks);
    const type = rng.chance(0.08) ? "ADJUST" : rng.chance(0.5) ? "IN" : "OUT";
    const ref = type === "IN" ? `PO-${rng.int(2000, 2999)}` : type === "OUT" ? `SO-${rng.int(5000, 5999)}` : null;
    movements.push([id, stock[1], stock[2], type, type === "ADJUST" ? rng.int(-10, 10) : rng.int(5, 200), ref, randomDateTime(rng)]);
  }
  movements.sort((a, b) => String(a[6]).localeCompare(String(b[6])));
  movements.forEach((m, i) => (m[0] = i + 1));
  parts.push(
    insert("stock_movements", ["id", "item_id", "warehouse_id", "movement_type", "quantity", "reference", "moved_at"], movements),
  );

  return parts.join("\n\n");
}
