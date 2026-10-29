import type { DatasetId } from "@/lib/sql/types";

export type Difficulty = "easy" | "medium" | "hard";

export type ChallengeCategory =
  | "SELECT"
  | "Filtering"
  | "Sorting"
  | "Aggregation"
  | "JOIN"
  | "Subquery"
  | "CTE"
  | "Window Function"
  | "Data Modification";

export interface Challenge {
  id: number;
  title: string;
  difficulty: Difficulty;
  category: ChallengeCategory;
  dataset: DatasetId;
  /** Tables worth looking at; shown next to the question. */
  tables: string[];
  question: string;
  solution: string;
  orderMatters?: boolean;
  /** For data modification: compared after running the answer on a fresh copy. */
  checkSql?: string;
  hints: [string, string, string];
}

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

export const CATEGORIES: ChallengeCategory[] = [
  "SELECT", "Filtering", "Sorting", "Aggregation", "JOIN", "Subquery", "CTE", "Window Function", "Data Modification",
];

export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "Katalog Produk",
    difficulty: "easy",
    category: "SELECT",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tampilkan `name` dan `price` dari semua produk.",
    solution: `SELECT name, price FROM products;`,
    hints: [
      "Kamu hanya butuh satu tabel: `products`.",
      "Sebutkan dua kolom di SELECT, dipisahkan koma.",
      "```sql\nSELECT name, price\nFROM products;\n```",
    ],
  },
  {
    id: 2,
    title: "User dari Bandung",
    difficulty: "easy",
    category: "Filtering",
    dataset: "ecommerce",
    tables: ["users"],
    question: "Tampilkan `name` dan `email` user yang tinggal di kota `Bandung`.",
    solution: `SELECT name, email FROM users WHERE city = 'Bandung';`,
    hints: [
      "Gunakan WHERE untuk memfilter kolom `city`.",
      "Teks ditulis dengan tanda kutip tunggal: `'Bandung'`.",
      "```sql\nSELECT name, email\nFROM users\nWHERE city = 'Bandung';\n```",
    ],
  },
  {
    id: 3,
    title: "Produk Menengah Siap Kirim",
    difficulty: "easy",
    category: "Filtering",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tampilkan `name`, `price`, dan `stock` produk dengan harga antara 100000 dan 500000 (inklusif) **dan** stok lebih dari 50.",
    solution: `SELECT name, price, stock FROM products WHERE price BETWEEN 100000 AND 500000 AND stock > 50;`,
    hints: [
      "Ada dua kondisi yang harus terpenuhi sekaligus — gabungkan dengan AND.",
      "`BETWEEN a AND b` sudah inklusif untuk kedua batas.",
      "```sql\nWHERE price BETWEEN 100000 AND 500000\n  AND stock > 50\n```",
    ],
  },
  {
    id: 4,
    title: "Stok Paling Sedikit",
    difficulty: "easy",
    category: "Sorting",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tampilkan `id`, `name`, dan `stock` dari 10 produk dengan stok paling sedikit. Urutkan berdasarkan `stock` dari kecil ke besar, lalu `id` jika stoknya sama.",
    solution: `SELECT id, name, stock FROM products ORDER BY stock ASC, id ASC LIMIT 10;`,
    orderMatters: true,
    hints: [
      "Urutkan dulu, lalu batasi jumlah barisnya.",
      "ORDER BY bisa memakai dua kolom: `ORDER BY stock, id`.",
      "```sql\nSELECT id, name, stock\nFROM products\nORDER BY stock ASC, id ASC\nLIMIT 10;\n```",
    ],
  },
  {
    id: 5,
    title: "5 Produk Termahal",
    difficulty: "easy",
    category: "Sorting",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tampilkan `name` dan `price` dari 5 produk dengan harga tertinggi, urut dari yang paling mahal.",
    solution: `SELECT name, price FROM products ORDER BY price DESC LIMIT 5;`,
    orderMatters: true,
    hints: [
      "Urutkan harga dari besar ke kecil.",
      "Gunakan `ORDER BY price DESC` lalu `LIMIT`.",
      "```sql\nSELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 5;\n```",
    ],
  },
  {
    id: 6,
    title: "Daftar Kota",
    difficulty: "easy",
    category: "SELECT",
    dataset: "ecommerce",
    tables: ["users"],
    question: "Tampilkan daftar `city` unik dari tabel users, urut A–Z.",
    solution: `SELECT DISTINCT city FROM users ORDER BY city;`,
    orderMatters: true,
    hints: [
      "Satu kota bisa dimiliki banyak user — hilangkan duplikatnya.",
      "Gunakan `SELECT DISTINCT` lalu `ORDER BY`.",
      "```sql\nSELECT DISTINCT city\nFROM users\nORDER BY city;\n```",
    ],
  },
  {
    id: 7,
    title: "Ringkasan Order Selesai",
    difficulty: "medium",
    category: "Aggregation",
    dataset: "ecommerce",
    tables: ["orders"],
    question: "Untuk order berstatus `completed`, tampilkan jumlah order dan rata-rata `total` yang dibulatkan tanpa desimal (`ROUND(..., 0)`).",
    solution: `SELECT COUNT(*) AS jumlah, ROUND(AVG(total), 0) AS rata_rata FROM orders WHERE status = 'completed';`,
    hints: [
      "Filter statusnya dulu dengan WHERE, lalu gunakan fungsi agregat.",
      "Kamu butuh `COUNT(*)` dan `AVG(total)`.",
      "```sql\nSELECT COUNT(*), ROUND(AVG(total), 0)\nFROM orders\nWHERE status = 'completed';\n```",
    ],
  },
  {
    id: 8,
    title: "Stok per Kategori",
    difficulty: "medium",
    category: "Aggregation",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tampilkan `category_id`, jumlah produk, dan total stok untuk setiap kategori.",
    solution: `SELECT category_id, COUNT(*) AS jumlah_produk, SUM(stock) AS total_stok FROM products GROUP BY category_id;`,
    hints: [
      "Data perlu dikelompokkan per kategori.",
      "Gunakan `GROUP BY category_id` dengan `COUNT(*)` dan `SUM(stock)`.",
      "```sql\nSELECT category_id, COUNT(*), SUM(stock)\nFROM products\nGROUP BY category_id;\n```",
    ],
  },
  {
    id: 9,
    title: "Pelanggan Loyal",
    difficulty: "medium",
    category: "Aggregation",
    dataset: "ecommerce",
    tables: ["orders"],
    question: "Tampilkan `user_id` dan jumlah order untuk user yang memiliki **lebih dari 5** order (semua status).",
    solution: `SELECT user_id, COUNT(*) AS jumlah_order FROM orders GROUP BY user_id HAVING COUNT(*) > 5;`,
    hints: [
      "Hitung jumlah order per user dengan GROUP BY.",
      "Filter hasil agregasi memakai HAVING, bukan WHERE.",
      "```sql\nSELECT user_id, COUNT(*)\nFROM orders\nGROUP BY user_id\nHAVING COUNT(*) > 5;\n```",
    ],
  },
  {
    id: 10,
    title: "Order yang Menunggu",
    difficulty: "medium",
    category: "JOIN",
    dataset: "ecommerce",
    tables: ["orders", "users"],
    question: "Tampilkan `id` order, `name` user pemilik order, dan `total` untuk semua order berstatus `pending`.",
    solution: `SELECT o.id, u.name, o.total FROM orders o JOIN users u ON u.id = o.user_id WHERE o.status = 'pending';`,
    hints: [
      "Nama user ada di tabel `users`, jadi kamu membutuhkan JOIN.",
      "Hubungkan `orders.user_id` dengan `users.id`.",
      "```sql\nFROM orders o\nJOIN users u\n    ON u.id = o.user_id\nWHERE o.status = 'pending'\n```",
    ],
  },
  {
    id: 11,
    title: "Penjualan per Kategori",
    difficulty: "hard",
    category: "JOIN",
    dataset: "ecommerce",
    tables: ["order_items", "products", "categories"],
    question: "Tampilkan nama kategori dan total `quantity` barang yang terjual untuk setiap kategori (hanya kategori yang pernah terjual).",
    solution: `SELECT c.name, SUM(oi.quantity) AS terjual FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id GROUP BY c.id, c.name;`,
    hints: [
      "Kamu perlu tiga tabel: order_items → products → categories.",
      "JOIN dua kali, lalu GROUP BY kategori dan SUM quantity.",
      "```sql\nFROM order_items oi\nJOIN products p   ON p.id = oi.product_id\nJOIN categories c ON c.id = p.category_id\nGROUP BY c.id, c.name\n```",
    ],
  },
  {
    id: 12,
    title: "Produk Tidak Laku",
    difficulty: "medium",
    category: "JOIN",
    dataset: "ecommerce",
    tables: ["products", "order_items"],
    question: "Tampilkan `id` dan `name` produk yang **belum pernah** ada di `order_items`.",
    solution: `SELECT p.id, p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL;`,
    hints: [
      "INNER JOIN justru membuang produk yang tidak punya pasangan.",
      "Gunakan LEFT JOIN, lalu cari baris yang sisi kanannya NULL.",
      "```sql\nFROM products p\nLEFT JOIN order_items oi ON oi.product_id = p.id\nWHERE oi.id IS NULL\n```",
    ],
  },
  {
    id: 13,
    title: "Status Stok",
    difficulty: "medium",
    category: "Aggregation",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Kelompokkan produk menjadi `Habis` (stok 0), `Menipis` (stok 1–9), dan `Aman` (stok ≥ 10). Tampilkan nama status dan jumlah produk di tiap status.",
    solution: `SELECT CASE WHEN stock = 0 THEN 'Habis' WHEN stock < 10 THEN 'Menipis' ELSE 'Aman' END AS status_stok, COUNT(*) AS jumlah FROM products GROUP BY status_stok;`,
    hints: [
      "Buat kolom status dengan CASE WHEN.",
      "Kelompokkan berdasarkan hasil CASE tersebut (bisa pakai alias kolomnya di GROUP BY).",
      "```sql\nSELECT\n  CASE WHEN stock = 0 THEN 'Habis'\n       WHEN stock < 10 THEN 'Menipis'\n       ELSE 'Aman' END AS status_stok,\n  COUNT(*)\nFROM products\nGROUP BY status_stok;\n```",
    ],
  },
  {
    id: 14,
    title: "Lebih Mahal dari Buku",
    difficulty: "medium",
    category: "Subquery",
    dataset: "ecommerce",
    tables: ["products", "categories"],
    question: "Tampilkan `name` dan `price` produk yang harganya lebih mahal dari produk **termahal** di kategori `Buku`.",
    solution: `SELECT name, price FROM products WHERE price > (SELECT MAX(p.price) FROM products p JOIN categories c ON c.id = p.category_id WHERE c.name = 'Buku');`,
    hints: [
      "Cari dulu harga maksimum produk kategori Buku dengan query terpisah.",
      "Masukkan query itu sebagai subquery di WHERE: `price > (SELECT ...)`.",
      "```sql\nWHERE price > (\n  SELECT MAX(p.price)\n  FROM products p\n  JOIN categories c ON c.id = p.category_id\n  WHERE c.name = 'Buku'\n)\n```",
    ],
  },
  {
    id: 15,
    title: "Top 3 Pembeli",
    difficulty: "hard",
    category: "CTE",
    dataset: "ecommerce",
    tables: ["orders", "users"],
    question: "Tampilkan `name` user dan total belanjanya (SUM `total` dari order berstatus `completed`) untuk 3 user dengan belanja terbesar, urut dari terbesar.",
    solution: `WITH belanja AS (SELECT user_id, SUM(total) AS total_belanja FROM orders WHERE status = 'completed' GROUP BY user_id) SELECT u.name, b.total_belanja FROM belanja b JOIN users u ON u.id = b.user_id ORDER BY b.total_belanja DESC LIMIT 3;`,
    orderMatters: true,
    hints: [
      "Pisahkan masalahnya: hitung total belanja per user dulu dalam sebuah CTE.",
      "JOIN hasil CTE ke `users` untuk mendapatkan nama, lalu ORDER BY dan LIMIT.",
      "```sql\nWITH belanja AS (\n  SELECT user_id, SUM(total) AS total_belanja\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY user_id\n)\nSELECT ...\n```",
    ],
  },
  {
    id: 16,
    title: "Semua Mitra",
    difficulty: "medium",
    category: "SELECT",
    dataset: "inventory",
    tables: ["suppliers", "warehouses"],
    question: "Tampilkan `name` dan `city` dari semua supplier **dan** semua gudang dalam satu hasil (2 kolom).",
    solution: `SELECT name, city FROM suppliers UNION ALL SELECT name, city FROM warehouses;`,
    hints: [
      "Datanya ada di dua tabel dengan struktur kolom yang mirip.",
      "Tumpuk hasil dua SELECT dengan UNION atau UNION ALL.",
      "```sql\nSELECT name, city FROM suppliers\nUNION ALL\nSELECT name, city FROM warehouses;\n```",
    ],
  },
  {
    id: 17,
    title: "Pembeli Elektronik",
    difficulty: "hard",
    category: "Subquery",
    dataset: "ecommerce",
    tables: ["users", "orders", "order_items", "products", "categories"],
    question: "Tampilkan `name` user yang pernah membeli minimal satu produk dari kategori `Elektronik` (setiap user cukup muncul sekali).",
    solution: `SELECT u.name FROM users u WHERE EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id WHERE o.user_id = u.id AND c.name = 'Elektronik');`,
    hints: [
      "Jalurnya: users → orders → order_items → products → categories.",
      "Gunakan EXISTS dengan subquery yang merujuk ke `u.id` agar tiap user muncul sekali.",
      "```sql\nSELECT u.name\nFROM users u\nWHERE EXISTS (\n  SELECT 1\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  ...\n  WHERE o.user_id = u.id AND c.name = 'Elektronik'\n);\n```",
    ],
  },
  {
    id: 18,
    title: "Juara Tiap Kategori",
    difficulty: "hard",
    category: "Window Function",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tampilkan `category_id`, `name`, dan `price` dari **satu** produk termahal di setiap kategori. Jika harga sama, pilih `id` terkecil.",
    solution: `SELECT category_id, name, price FROM (SELECT category_id, name, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC, id ASC) AS rn FROM products) WHERE rn = 1;`,
    hints: [
      "Beri nomor urut produk di dalam setiap kategori berdasarkan harga.",
      "`ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC, id)` lalu ambil yang nomornya 1.",
      "```sql\nSELECT category_id, name, price\nFROM (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY category_id\n    ORDER BY price DESC, id ASC) AS rn\n  FROM products\n)\nWHERE rn = 1;\n```",
    ],
  },
  {
    id: 19,
    title: "Produk Baru",
    difficulty: "easy",
    category: "Data Modification",
    dataset: "ecommerce",
    tables: ["products"],
    question: "Tambahkan produk baru: name `Kopi Susu Gula Aren`, category_id `7`, price `18000`, stock `50`.",
    solution: `INSERT INTO products (name, category_id, price, stock) VALUES ('Kopi Susu Gula Aren', 7, 18000, 50);`,
    checkSql: `SELECT name, category_id, price, stock FROM products ORDER BY id;`,
    hints: [
      "Gunakan INSERT INTO dengan daftar kolom.",
      "Kolom `id` tidak perlu diisi, SQLite mengisinya otomatis.",
      "```sql\nINSERT INTO products (name, category_id, price, stock)\nVALUES ('Kopi Susu Gula Aren', 7, 18000, 50);\n```",
    ],
  },
  {
    id: 20,
    title: "Kenaikan Harga Buku",
    difficulty: "medium",
    category: "Data Modification",
    dataset: "ecommerce",
    tables: ["products", "categories"],
    question: "Naikkan harga **semua** produk di kategori `Buku` sebesar 5000. Produk lain tidak boleh berubah.",
    solution: `UPDATE products SET price = price + 5000 WHERE category_id = (SELECT id FROM categories WHERE name = 'Buku');`,
    checkSql: `SELECT id, price FROM products ORDER BY id;`,
    hints: [
      "Gunakan UPDATE ... SET price = price + 5000.",
      "Batasi dengan WHERE — cari `id` kategori Buku terlebih dulu (atau pakai subquery).",
      "```sql\nUPDATE products\nSET price = price + 5000\nWHERE category_id = (\n  SELECT id FROM categories WHERE name = 'Buku'\n);\n```",
    ],
  },
  {
    id: 21,
    title: "Isi Setiap Gudang",
    difficulty: "medium",
    category: "JOIN",
    dataset: "inventory",
    tables: ["warehouses", "stocks"],
    question: "Tampilkan `name` gudang dan total `quantity` stok di gudang tersebut.",
    solution: `SELECT w.name, SUM(s.quantity) AS total_stok FROM warehouses w JOIN stocks s ON s.warehouse_id = w.id GROUP BY w.id, w.name;`,
    hints: [
      "Stok per gudang ada di tabel `stocks`.",
      "JOIN `stocks` ke `warehouses`, lalu GROUP BY gudang.",
      "```sql\nSELECT w.name, SUM(s.quantity)\nFROM warehouses w\nJOIN stocks s ON s.warehouse_id = w.id\nGROUP BY w.id, w.name;\n```",
    ],
  },
  {
    id: 22,
    title: "Waktunya Reorder",
    difficulty: "hard",
    category: "Aggregation",
    dataset: "inventory",
    tables: ["items", "stocks"],
    question: "Tampilkan `sku`, `name`, dan total stok (semua gudang) untuk item yang total stoknya **di bawah** `reorder_level`. Item tanpa data stok dihitung 0.",
    solution: `SELECT i.sku, i.name, COALESCE(SUM(s.quantity), 0) AS total_stok FROM items i LEFT JOIN stocks s ON s.item_id = i.id GROUP BY i.id, i.sku, i.name, i.reorder_level HAVING COALESCE(SUM(s.quantity), 0) < i.reorder_level;`,
    hints: [
      "Item tanpa stok tidak boleh hilang — pakai LEFT JOIN.",
      "`SUM` dari baris kosong menghasilkan NULL; ubah jadi 0 dengan `COALESCE`.",
      "```sql\nSELECT i.sku, i.name, COALESCE(SUM(s.quantity), 0) AS total_stok\nFROM items i\nLEFT JOIN stocks s ON s.item_id = i.id\nGROUP BY i.id\nHAVING total_stok < i.reorder_level;\n```",
    ],
  },
  {
    id: 23,
    title: "Sudah Dipacking, Belum Dikirim",
    difficulty: "hard",
    category: "JOIN",
    dataset: "warehouse",
    tables: ["orders", "packing", "shipping"],
    question: "Tampilkan `order_number` dan `customer` dari order yang sudah ada di `packing` tetapi **belum** ada di `shipping`.",
    solution: `SELECT o.order_number, o.customer FROM orders o JOIN packing pk ON pk.order_id = o.id LEFT JOIN shipping s ON s.order_id = o.id WHERE s.id IS NULL;`,
    hints: [
      "Order harus punya pasangan di `packing` (INNER JOIN).",
      "Order tidak boleh punya pasangan di `shipping` (LEFT JOIN ... IS NULL, atau NOT EXISTS).",
      "```sql\nFROM orders o\nJOIN packing pk ON pk.order_id = o.id\nLEFT JOIN shipping s ON s.order_id = o.id\nWHERE s.id IS NULL\n```",
    ],
  },
  {
    id: 24,
    title: "Kecepatan Kurir",
    difficulty: "hard",
    category: "Aggregation",
    dataset: "warehouse",
    tables: ["orders", "shipping"],
    question: "Untuk setiap `carrier`, hitung rata-rata jam dari order dibuat (`orders.created_at`) hingga dikirim (`shipping.shipped_at`), dibulatkan 1 desimal. Tampilkan `carrier` dan rata-ratanya.",
    solution: `SELECT s.carrier, ROUND(AVG((julianday(s.shipped_at) - julianday(o.created_at)) * 24), 1) AS rata_jam FROM shipping s JOIN orders o ON o.id = s.order_id GROUP BY s.carrier;`,
    hints: [
      "Selisih waktu di SQLite bisa dihitung dengan `julianday()` (hasilnya dalam hari).",
      "Kalikan selisih hari dengan 24 untuk mendapatkan jam, lalu AVG per carrier.",
      "```sql\nSELECT s.carrier,\n  ROUND(AVG((julianday(s.shipped_at) - julianday(o.created_at)) * 24), 1)\nFROM shipping s\nJOIN orders o ON o.id = s.order_id\nGROUP BY s.carrier;\n```",
    ],
  },
  {
    id: 25,
    title: "Picker Tersibuk",
    difficulty: "medium",
    category: "Aggregation",
    dataset: "warehouse",
    tables: ["picking"],
    question: "Tampilkan setiap `picker` dan total `quantity` yang sudah dia ambil, urut dari yang terbanyak.",
    solution: `SELECT picker, SUM(quantity) AS total_qty FROM picking GROUP BY picker ORDER BY total_qty DESC;`,
    orderMatters: true,
    hints: [
      "Kelompokkan tabel `picking` per picker.",
      "Gunakan SUM(quantity), lalu ORDER BY hasilnya secara DESC.",
      "```sql\nSELECT picker, SUM(quantity) AS total_qty\nFROM picking\nGROUP BY picker\nORDER BY total_qty DESC;\n```",
    ],
  },
];

export function getChallenge(id: number): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
