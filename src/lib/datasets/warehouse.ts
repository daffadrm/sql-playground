import { FIRST_NAMES, addMinutes, createRng, insert, randomDateTime, type Cell } from "./builder";

// Warehouse operations flow: receiving -> putaway -> inventory -> orders -> picking -> packing -> shipping
const SCHEMA = `
CREATE TABLE receiving (
  id INTEGER PRIMARY KEY,
  po_number TEXT NOT NULL,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  supplier TEXT NOT NULL,
  status TEXT NOT NULL,
  received_at TEXT NOT NULL
);

CREATE TABLE putaway (
  id INTEGER PRIMARY KEY,
  receiving_id INTEGER NOT NULL REFERENCES receiving(id),
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  operator TEXT NOT NULL,
  putaway_at TEXT NOT NULL
);

CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  UNIQUE (sku, location)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE picking (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  sku TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  picker TEXT NOT NULL,
  picked_at TEXT NOT NULL
);

CREATE TABLE packing (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  box_type TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  packer TEXT NOT NULL,
  packed_at TEXT NOT NULL
);

CREATE TABLE shipping (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  carrier TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  status TEXT NOT NULL,
  shipped_at TEXT NOT NULL
);
`;

const SUPPLIERS = ["PT Sumber Makmur", "CV Jaya Abadi", "PT Maju Bersama", "PT Sinar Terang", "PT Prima Niaga"];
const CUSTOMERS = ["Toko Sinar", "Mart Sejahtera", "Grosir Makmur", "Toko Berkah", "Minimarket 24", "Swalayan Jaya", "Toko Amanah", "Distributor Timur"];
const CARRIERS = ["JNE", "J&T", "SiCepat", "AnterAja", "Pos Indonesia"];
const BOXES = ["Small", "Medium", "Large", "Pallet"];

export function buildWarehouse(): string {
  const rng = createRng(4242);
  const parts: string[] = [SCHEMA];

  const skus = Array.from({ length: 40 }, (_, i) => `SKU-${String(2001 + i)}`);
  const locations: string[] = [];
  for (const zone of ["A", "B", "C", "D"]) {
    for (let rack = 1; rack <= 5; rack++) {
      for (const level of [1, 2]) locations.push(`${zone}-${String(rack).padStart(2, "0")}-${level}`);
    }
  }
  const operators = FIRST_NAMES.slice(0, 8);

  const receiving: Cell[][] = [];
  for (let id = 1; id <= 100; id++) {
    const status = id > 92 ? "pending" : rng.chance(0.05) ? "rejected" : "received";
    receiving.push([id, `PO-${String(3000 + Math.ceil(id / 3))}`, rng.pick(skus), rng.int(10, 300), rng.pick(SUPPLIERS), status, randomDateTime(rng, 1, 11)]);
  }
  receiving.sort((a, b) => String(a[6]).localeCompare(String(b[6])));
  receiving.forEach((r, i) => (r[0] = i + 1));
  parts.push(insert("receiving", ["id", "po_number", "sku", "quantity", "supplier", "status", "received_at"], receiving));

  const putaway: Cell[][] = [];
  const stock = new Map<string, number>();
  for (const r of receiving) {
    if (r[5] !== "received") continue;
    const location = rng.pick(locations);
    putaway.push([putaway.length + 1, r[0], location, r[3], rng.pick(operators), addMinutes(String(r[6]), rng.int(30, 480))]);
    const key = `${r[2]}|${location}`;
    stock.set(key, (stock.get(key) ?? 0) + Number(r[3]));
  }
  parts.push(insert("putaway", ["id", "receiving_id", "location", "quantity", "operator", "putaway_at"], putaway));

  const orders: Cell[][] = [];
  for (let id = 1; id <= 120; id++) {
    orders.push([id, "", rng.pick(CUSTOMERS), rng.chance(0.2) ? "high" : rng.chance(0.5) ? "normal" : "low", "", randomDateTime(rng, 6, 12)]);
  }
  orders.sort((a, b) => String(a[5]).localeCompare(String(b[5])));
  orders.forEach((o, i) => {
    o[0] = i + 1;
    o[1] = `WO-${String(10000 + i + 1)}`;
  });

  // Each order progresses a random distance through the pipeline.
  const picking: Cell[][] = [];
  const packing: Cell[][] = [];
  const shipping: Cell[][] = [];
  const stockKeys = [...stock.keys()];
  for (const o of orders) {
    const stage = rng.chance(0.08) ? 0 : rng.chance(0.1) ? 1 : rng.chance(0.1) ? 2 : 3;
    o[4] = ["new", "picked", "packed", "shipped"][stage];
    if (stage === 0) continue;
    const created = String(o[5]);
    const lines = rng.int(1, 4);
    for (let n = 0; n < lines; n++) {
      const [sku, location] = rng.pick(stockKeys).split("|");
      const qty = rng.int(1, 20);
      picking.push([picking.length + 1, o[0], sku, location, qty, rng.pick(operators), addMinutes(created, rng.int(20, 240))]);
      const key = `${sku}|${location}`;
      stock.set(key, Math.max(0, (stock.get(key) ?? 0) - qty));
    }
    if (stage < 2) continue;
    const packedAt = addMinutes(created, rng.int(260, 600));
    packing.push([packing.length + 1, o[0], rng.pick(BOXES), Math.round(rng.next() * 400 + 5) / 10, rng.pick(operators), packedAt]);
    if (stage < 3) continue;
    shipping.push([
      shipping.length + 1,
      o[0],
      rng.pick(CARRIERS),
      `TRK${rng.int(100000000, 999999999)}`,
      rng.chance(0.75) ? "delivered" : "in_transit",
      addMinutes(packedAt, rng.int(60, 1440)),
    ]);
  }

  const inventory: Cell[][] = [...stock.entries()].map(([key, qty], i) => {
    const [sku, location] = key.split("|");
    return [i + 1, sku, location, qty];
  });
  parts.push(insert("inventory", ["id", "sku", "location", "quantity"], inventory));
  parts.push(insert("orders", ["id", "order_number", "customer", "priority", "status", "created_at"], orders));
  parts.push(insert("picking", ["id", "order_id", "sku", "location", "quantity", "picker", "picked_at"], picking));
  parts.push(insert("packing", ["id", "order_id", "box_type", "weight_kg", "packer", "packed_at"], packing));
  parts.push(insert("shipping", ["id", "order_id", "carrier", "tracking_number", "status", "shipped_at"], shipping));

  return parts.join("\n\n");
}
