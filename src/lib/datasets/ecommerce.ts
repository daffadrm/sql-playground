import {
  CITIES,
  FIRST_NAMES,
  LAST_NAMES,
  addMinutes,
  createRng,
  insert,
  randomDateTime,
  type Cell,
} from "./builder";

const SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  department_id INTEGER REFERENCES departments(id),
  created_at TEXT NOT NULL
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  method TEXT NOT NULL,
  amount INTEGER NOT NULL,
  paid_at TEXT NOT NULL
);
`;

const DEPARTMENTS = [
  "Engineering", "Marketing", "Finance", "Human Resources", "Sales", "Operations", "Legal", "Research",
];

// category name -> [product nouns, price range]
const CATALOG: [string, string[], [number, number]][] = [
  ["Elektronik", ["Headphone", "Speaker Bluetooth", "Power Bank", "Mouse Wireless", "Keyboard Mekanik", "Smartwatch", "Webcam", "Charger"], [75000, 2500000]],
  ["Fashion", ["Kaos Polos", "Kemeja Flanel", "Jaket Denim", "Celana Chino", "Hoodie", "Topi Baseball", "Sepatu Sneakers", "Tas Ransel"], [45000, 650000]],
  ["Rumah Tangga", ["Panci Set", "Wajan Anti Lengket", "Blender", "Rice Cooker", "Dispenser", "Setrika", "Rak Piring", "Lampu LED"], [25000, 1200000]],
  ["Olahraga", ["Matras Yoga", "Dumbbell", "Bola Futsal", "Raket Badminton", "Botol Minum", "Sarung Tinju", "Tali Skipping"], [20000, 900000]],
  ["Buku", ["Novel Fiksi", "Buku Resep", "Komik", "Buku Pemrograman", "Kamus", "Buku Anak"], [30000, 250000]],
  ["Kecantikan", ["Sunscreen", "Serum Wajah", "Lip Balm", "Sabun Cuci Muka", "Masker Wajah", "Parfum"], [15000, 450000]],
  ["Makanan", ["Kopi Bubuk", "Teh Hijau", "Keripik Singkong", "Madu Murni", "Granola", "Cokelat Batang"], [5000, 150000]],
];
const VARIANTS = ["Hitam", "Putih", "Biru", "Merah", "Abu", "Premium", "Mini", "Pro", "Lite", "Classic"];

const ORDER_STATUSES = ["completed", "completed", "completed", "shipped", "shipped", "pending", "cancelled"];
const PAYMENT_METHODS = ["transfer", "credit_card", "e_wallet", "cod"];

export function buildEcommerce(): string {
  const rng = createRng(20250101);
  const parts: string[] = [SCHEMA];

  parts.push(insert("departments", ["id", "name"], DEPARTMENTS.map((n, i) => [i + 1, n])));

  // Department 8 (Research) intentionally has no users -> good for LEFT/RIGHT JOIN lessons.
  const users: Cell[][] = [];
  for (let id = 1; id <= 50; id++) {
    const first = FIRST_NAMES[(id - 1) % FIRST_NAMES.length];
    const last = rng.pick(LAST_NAMES);
    const dept = id % 12 === 0 ? null : rng.int(1, 7);
    users.push([
      id,
      `${first} ${last}`,
      `${first.toLowerCase()}.${last.toLowerCase()}${id}@mail.com`,
      rng.pick(CITIES),
      dept,
      randomDateTime(rng, 1, 3),
    ]);
  }
  parts.push(insert("users", ["id", "name", "email", "city", "department_id", "created_at"], users));

  const categories = [...CATALOG.map((c) => c[0]), "Otomotif"]; // Otomotif has no products
  parts.push(insert("categories", ["id", "name"], categories.map((n, i) => [i + 1, n])));

  const products: { id: number; price: number }[] = [];
  const productRows: Cell[][] = [];
  const usedNames = new Set<string>();
  for (let id = 1; id <= 100; id++) {
    const catIndex = (id - 1) % CATALOG.length;
    const [, nouns, [min, max]] = CATALOG[catIndex];
    let name = "";
    do {
      name = `${rng.pick(nouns)} ${rng.pick(VARIANTS)}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    const price = Math.round(rng.int(min, max) / 500) * 500;
    const stock = rng.chance(0.15) ? rng.int(0, 9) : rng.int(10, 250);
    products.push({ id, price });
    productRows.push([id, name, catIndex + 1, price, stock]);
  }
  parts.push(insert("products", ["id", "name", "category_id", "price", "stock"], productRows));

  // Only the first 90 products are ever ordered -> products 91..100 are "never sold".
  const sellable = products.slice(0, 90);

  // Users 46..50 never order anything.
  const orders: { id: number; userId: number; status: string; createdAt: string; total: number }[] = [];
  for (let id = 1; id <= 200; id++) {
    orders.push({
      id,
      userId: rng.int(1, 45),
      status: rng.pick(ORDER_STATUSES),
      createdAt: randomDateTime(rng, 1, 12),
      total: 0,
    });
  }
  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  orders.forEach((o, i) => (o.id = i + 1));

  const items: Cell[][] = [];
  const itemsPerOrder = orders.map(() => 1);
  for (let i = 200; i < 500; i++) itemsPerOrder[rng.int(0, 199)]++;
  let itemId = 1;
  orders.forEach((order, index) => {
    const chosen = new Set<number>();
    for (let n = 0; n < itemsPerOrder[index]; n++) {
      let product = rng.pick(sellable);
      while (chosen.has(product.id) && chosen.size < sellable.length) product = rng.pick(sellable);
      chosen.add(product.id);
      const qty = rng.int(1, 4);
      order.total += qty * product.price;
      items.push([itemId++, order.id, product.id, qty, product.price]);
    }
  });

  parts.push(
    insert(
      "orders",
      ["id", "user_id", "status", "total", "created_at"],
      orders.map((o) => [o.id, o.userId, o.status, o.total, o.createdAt]),
    ),
  );
  parts.push(insert("order_items", ["id", "order_id", "product_id", "quantity", "price"], items));

  const payments: Cell[][] = [];
  for (const o of orders) {
    if (o.status === "pending" || o.status === "cancelled") continue;
    payments.push([payments.length + 1, o.id, rng.pick(PAYMENT_METHODS), o.total, addMinutes(o.createdAt, rng.int(5, 600))]);
  }
  parts.push(insert("payments", ["id", "order_id", "method", "amount", "paid_at"], payments));

  return parts.join("\n\n");
}
