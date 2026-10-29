import type { DatasetId } from "@/lib/sql/types";

export type Level = "beginner" | "intermediate" | "advanced";

export interface Practice {
  task: string;
  solution: string;
  orderMatters?: boolean;
  /** For INSERT/UPDATE/DELETE: query whose result is compared after running the answer. */
  checkSql?: string;
}

export interface Lesson {
  slug: string;
  title: string;
  level: Level;
  summary: string;
  dataset: DatasetId;
  /** Mini markdown: paragraphs, "- " lists, ```sql blocks, `code`, **bold**. */
  explanation: string;
  example: string;
  practice: Practice;
  challengeIds: number[];
}

export const LEVELS: { id: Level; label: string; description: string }[] = [
  { id: "beginner", label: "Beginner", description: "Dasar membaca dan mengubah data." },
  { id: "intermediate", label: "Intermediate", description: "Agregasi, JOIN, dan logika query." },
  { id: "advanced", label: "Advanced", description: "CTE, window function, dan performa." },
];

export const LESSONS: Lesson[] = [
  // ───────────── Beginner ─────────────
  {
    slug: "intro-sql",
    title: "Introduction to SQL",
    level: "beginner",
    summary: "Apa itu SQL dan bagaimana query dijalankan.",
    dataset: "ecommerce",
    explanation: `**SQL (Structured Query Language)** adalah bahasa untuk berbicara dengan database relasional. Dengan SQL kamu bisa mengambil, menambah, mengubah, dan menghapus data.

Hampir semua aplikasi yang menyimpan data — toko online, aplikasi bank, sistem gudang — menggunakan database, dan SQL adalah cara standar untuk mengaksesnya.

Perintah SQL disebut **query**. Query paling sederhana bahkan tidak perlu tabel:

\`\`\`sql
SELECT 1 + 2;
\`\`\`

Beberapa hal yang perlu diingat:

- Keyword SQL (SELECT, FROM, WHERE) tidak case-sensitive, tetapi biasanya ditulis kapital agar mudah dibaca.
- Teks ditulis dengan tanda kutip tunggal: \`'Halo'\`.
- \`AS\` memberi nama (alias) untuk kolom hasil.
- Akhiri query dengan titik koma \`;\`.

Aplikasi ini memakai **SQLite** yang berjalan langsung di browser kamu. Semua data adalah data dummy, jadi bebas bereksperimen.`,
    example: `SELECT 'Halo SQL!' AS pesan, 1 + 2 AS hasil;`,
    practice: {
      task: "Tampilkan teks `Saya belajar SQL` dengan nama kolom `kalimat`.",
      solution: `SELECT 'Saya belajar SQL' AS kalimat;`,
    },
    challengeIds: [],
  },
  {
    slug: "database-table",
    title: "Database & Table",
    level: "beginner",
    summary: "Database, tabel, kolom, baris, primary key, dan foreign key.",
    dataset: "ecommerce",
    explanation: `Sebuah **database** berisi kumpulan **tabel**. Setiap tabel mirip spreadsheet:

- **Kolom** (column) mendefinisikan jenis data, misalnya \`name\` bertipe TEXT dan \`price\` bertipe INTEGER.
- **Baris** (row) adalah satu data, misalnya satu produk.

Dua jenis kolom penting:

- **Primary key (PK)** — identitas unik setiap baris, biasanya kolom \`id\`.
- **Foreign key (FK)** — kolom yang menunjuk ke primary key di tabel lain. Contoh: \`users.department_id\` menunjuk ke \`departments.id\`.

Dataset E-Commerce di aplikasi ini punya tabel \`users\`, \`departments\`, \`products\`, \`categories\`, \`orders\`, \`order_items\`, dan \`payments\`. Buka menu **Database** untuk melihat struktur dan relasinya.

Untuk melihat seluruh isi sebuah tabel, gunakan \`SELECT * FROM nama_tabel\`. Tanda \`*\` artinya "semua kolom".`,
    example: `SELECT * FROM departments;`,
    practice: {
      task: "Tampilkan semua kolom dan semua baris dari tabel `categories`.",
      solution: `SELECT * FROM categories;`,
    },
    challengeIds: [],
  },
  {
    slug: "select",
    title: "SELECT",
    level: "beginner",
    summary: "Memilih kolom yang ingin ditampilkan.",
    dataset: "ecommerce",
    explanation: `\`SELECT\` menentukan **kolom apa** yang ingin ditampilkan, dan \`FROM\` menentukan **dari tabel mana**.

\`\`\`sql
SELECT kolom1, kolom2
FROM nama_tabel;
\`\`\`

Tips:

- Pisahkan kolom dengan koma. Jangan beri koma setelah kolom terakhir.
- Pilih hanya kolom yang dibutuhkan — lebih jelas dan lebih cepat dibanding \`SELECT *\`.
- Kamu bisa membuat kolom hasil perhitungan dan memberinya alias dengan \`AS\`.`,
    example: `SELECT name, price, price * 2 AS harga_dua_pcs
FROM products;`,
    practice: {
      task: "Tampilkan kolom `name` dan `email` dari tabel `users`.",
      solution: `SELECT name, email FROM users;`,
    },
    challengeIds: [1],
  },
  {
    slug: "where",
    title: "WHERE",
    level: "beginner",
    summary: "Memfilter baris berdasarkan kondisi.",
    dataset: "ecommerce",
    explanation: `\`WHERE\` digunakan untuk melakukan **filtering** terhadap data. Hanya baris yang memenuhi kondisi yang ditampilkan.

Operator yang sering dipakai:

- Perbandingan: \`=\`, \`<>\` (tidak sama), \`>\`, \`<\`, \`>=\`, \`<=\`
- Gabungan kondisi: \`AND\`, \`OR\`, \`NOT\`
- Rentang: \`BETWEEN 10000 AND 50000\`
- Daftar nilai: \`IN ('Jakarta', 'Bandung')\`
- Pola teks: \`LIKE 'Kaos%'\` (\`%\` = teks apa saja)
- Nilai kosong: \`IS NULL\` / \`IS NOT NULL\`

\`\`\`sql
SELECT *
FROM products
WHERE price > 10000;
\`\`\``,
    example: `SELECT name, price, stock
FROM products
WHERE price > 10000
  AND stock < 20;`,
    practice: {
      task: "Tampilkan `name` dan `stock` dari produk yang stoknya kurang dari 10.",
      solution: `SELECT name, stock FROM products WHERE stock < 10;`,
    },
    challengeIds: [2, 3],
  },
  {
    slug: "order-by",
    title: "ORDER BY",
    level: "beginner",
    summary: "Mengurutkan hasil query.",
    dataset: "ecommerce",
    explanation: `\`ORDER BY\` mengurutkan hasil berdasarkan satu atau beberapa kolom.

- \`ASC\` — naik (kecil ke besar, A ke Z). Ini default.
- \`DESC\` — turun (besar ke kecil, Z ke A).

Kamu bisa mengurutkan dengan beberapa kolom. Kolom kedua dipakai jika nilai kolom pertama sama:

\`\`\`sql
ORDER BY category_id ASC, price DESC
\`\`\`

Tanpa ORDER BY, urutan hasil **tidak dijamin**.`,
    example: `SELECT name, category_id, price
FROM products
ORDER BY category_id ASC, price DESC;`,
    practice: {
      task: "Tampilkan `name` dan `email` semua user, urut berdasarkan `name` dari A ke Z. Jika nama sama, urutkan berdasarkan `id`.",
      solution: `SELECT name, email FROM users ORDER BY name ASC, id ASC;`,
      orderMatters: true,
    },
    challengeIds: [4],
  },
  {
    slug: "limit",
    title: "LIMIT",
    level: "beginner",
    summary: "Membatasi jumlah baris hasil.",
    dataset: "ecommerce",
    explanation: `\`LIMIT\` membatasi jumlah baris yang dikembalikan. Biasanya dipakai bersama \`ORDER BY\` untuk mengambil "top N".

\`OFFSET\` melewati sejumlah baris terlebih dahulu — berguna untuk pagination:

\`\`\`sql
-- halaman 2, 10 data per halaman
SELECT * FROM products
ORDER BY id
LIMIT 10 OFFSET 10;
\`\`\``,
    example: `SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 5;`,
    practice: {
      task: "Tampilkan `id`, `created_at`, dan `total` dari 3 order paling baru (berdasarkan `created_at`).",
      solution: `SELECT id, created_at, total FROM orders ORDER BY created_at DESC LIMIT 3;`,
      orderMatters: true,
    },
    challengeIds: [5],
  },
  {
    slug: "distinct",
    title: "DISTINCT",
    level: "beginner",
    summary: "Menghilangkan data duplikat.",
    dataset: "ecommerce",
    explanation: `\`DISTINCT\` menghapus baris duplikat dari hasil query.

\`\`\`sql
SELECT DISTINCT city FROM users;
\`\`\`

Jika dipakai dengan beberapa kolom, DISTINCT melihat **kombinasi** nilai kolom tersebut:

\`\`\`sql
SELECT DISTINCT city, department_id FROM users;
\`\`\`

Untuk menghitung jumlah nilai unik gunakan \`COUNT(DISTINCT kolom)\`.`,
    example: `SELECT DISTINCT city
FROM users
ORDER BY city;`,
    practice: {
      task: "Tampilkan daftar `status` order yang berbeda (tanpa duplikat).",
      solution: `SELECT DISTINCT status FROM orders;`,
    },
    challengeIds: [6],
  },
  {
    slug: "insert",
    title: "INSERT",
    level: "beginner",
    summary: "Menambahkan data baru.",
    dataset: "ecommerce",
    explanation: `\`INSERT INTO\` menambahkan baris baru ke tabel.

\`\`\`sql
INSERT INTO nama_tabel (kolom1, kolom2)
VALUES (nilai1, nilai2);
\`\`\`

Tips:

- Sebutkan nama kolom secara eksplisit agar urutan nilai jelas.
- Beberapa baris sekaligus: \`VALUES (...), (...), (...)\`.
- Kolom \`INTEGER PRIMARY KEY\` di SQLite terisi otomatis jika tidak diisi.

Perubahan data hanya terjadi di browser kamu. Di Playground ada tombol **Reset Data** untuk mengembalikan data awal.`,
    example: `INSERT INTO categories (name)
VALUES ('Mainan');

SELECT * FROM categories;`,
    practice: {
      task: "Tambahkan department baru bernama `Customer Service` ke tabel `departments`.",
      solution: `INSERT INTO departments (name) VALUES ('Customer Service');`,
      checkSql: `SELECT id, name FROM departments ORDER BY id;`,
    },
    challengeIds: [19],
  },
  {
    slug: "update",
    title: "UPDATE",
    level: "beginner",
    summary: "Mengubah data yang sudah ada.",
    dataset: "ecommerce",
    explanation: `\`UPDATE\` mengubah nilai kolom pada baris yang sudah ada.

\`\`\`sql
UPDATE nama_tabel
SET kolom = nilai_baru
WHERE kondisi;
\`\`\`

**Selalu gunakan WHERE!** Tanpa WHERE, semua baris di tabel akan berubah.

Nilai baru bisa berupa perhitungan dari nilai lama, misalnya \`SET stock = stock + 10\`.`,
    example: `UPDATE products
SET stock = stock + 10
WHERE stock < 10;

SELECT name, stock FROM products ORDER BY stock LIMIT 5;`,
    practice: {
      task: "Ubah `status` order dengan `id` 5 menjadi `cancelled`.",
      solution: `UPDATE orders SET status = 'cancelled' WHERE id = 5;`,
      checkSql: `SELECT id, status FROM orders ORDER BY id;`,
    },
    challengeIds: [20],
  },
  {
    slug: "delete",
    title: "DELETE",
    level: "beginner",
    summary: "Menghapus data.",
    dataset: "ecommerce",
    explanation: `\`DELETE FROM\` menghapus baris dari tabel.

\`\`\`sql
DELETE FROM nama_tabel
WHERE kondisi;
\`\`\`

Sama seperti UPDATE, **selalu gunakan WHERE**. \`DELETE FROM products;\` tanpa WHERE menghapus semua produk.

Database menjaga **foreign key**: kamu tidak bisa menghapus produk yang masih dipakai di \`order_items\`. Hal ini mencegah data "yatim" yang menunjuk ke data yang sudah tidak ada.

Tip: jalankan dulu \`SELECT\` dengan WHERE yang sama untuk memastikan baris yang akan dihapus sudah benar.`,
    example: `DELETE FROM payments
WHERE method = 'cod';

SELECT method, COUNT(*) AS jumlah FROM payments GROUP BY method;`,
    practice: {
      task: "Hapus kategori `Otomotif` dari tabel `categories` (kategori ini belum punya produk).",
      solution: `DELETE FROM categories WHERE name = 'Otomotif';`,
      checkSql: `SELECT id, name FROM categories ORDER BY id;`,
    },
    challengeIds: [],
  },

  // ───────────── Intermediate ─────────────
  {
    slug: "aggregate-function",
    title: "Aggregate Function",
    level: "intermediate",
    summary: "COUNT, SUM, AVG, MIN, MAX.",
    dataset: "ecommerce",
    explanation: `Fungsi agregat merangkum banyak baris menjadi satu nilai:

- \`COUNT(*)\` — jumlah baris
- \`COUNT(kolom)\` — jumlah baris yang kolomnya tidak NULL
- \`SUM(kolom)\` — total
- \`AVG(kolom)\` — rata-rata
- \`MIN(kolom)\` / \`MAX(kolom)\` — nilai terkecil / terbesar

Gabungkan dengan WHERE untuk merangkum sebagian data saja. \`ROUND(nilai, 2)\` membulatkan hasil desimal.`,
    example: `SELECT
  COUNT(*)          AS total_produk,
  MIN(price)        AS termurah,
  MAX(price)        AS termahal,
  ROUND(AVG(price)) AS rata_rata
FROM products;`,
    practice: {
      task: "Hitung total pendapatan (`SUM` dari `total`) dari semua order dengan status `completed`.",
      solution: `SELECT SUM(total) AS pendapatan FROM orders WHERE status = 'completed';`,
    },
    challengeIds: [7],
  },
  {
    slug: "group-by",
    title: "GROUP BY",
    level: "intermediate",
    summary: "Mengelompokkan data lalu merangkum per kelompok.",
    dataset: "ecommerce",
    explanation: `\`GROUP BY\` mengelompokkan baris yang punya nilai sama, lalu fungsi agregat dihitung **per kelompok**.

\`\`\`sql
SELECT kolom_kelompok, COUNT(*)
FROM tabel
GROUP BY kolom_kelompok;
\`\`\`

Aturan penting: kolom di SELECT yang **bukan** agregat sebaiknya ada di GROUP BY.

Urutan penulisan klausa: \`SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT\`.`,
    example: `SELECT category_id, COUNT(*) AS jumlah_produk, SUM(stock) AS total_stok
FROM products
GROUP BY category_id;`,
    practice: {
      task: "Tampilkan setiap `status` order beserta jumlah order-nya.",
      solution: `SELECT status, COUNT(*) AS jumlah FROM orders GROUP BY status;`,
    },
    challengeIds: [8],
  },
  {
    slug: "having",
    title: "HAVING",
    level: "intermediate",
    summary: "Memfilter hasil agregasi.",
    dataset: "ecommerce",
    explanation: `\`WHERE\` memfilter **baris sebelum** dikelompokkan, sedangkan \`HAVING\` memfilter **kelompok setelah** agregasi.

\`\`\`sql
SELECT user_id, COUNT(*) AS jumlah_order
FROM orders
WHERE status = 'completed'   -- filter baris
GROUP BY user_id
HAVING COUNT(*) >= 3;        -- filter kelompok
\`\`\`

Fungsi agregat seperti \`COUNT(*) > 5\` tidak bisa dipakai di WHERE — gunakan HAVING.`,
    example: `SELECT user_id, COUNT(*) AS jumlah_order
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 7;`,
    practice: {
      task: "Tampilkan `city` dan jumlah user di kota tersebut, hanya untuk kota yang memiliki lebih dari 5 user.",
      solution: `SELECT city, COUNT(*) AS jumlah_user FROM users GROUP BY city HAVING COUNT(*) > 5;`,
    },
    challengeIds: [9],
  },
  {
    slug: "inner-join",
    title: "INNER JOIN",
    level: "intermediate",
    summary: "Menggabungkan tabel yang saling berelasi.",
    dataset: "ecommerce",
    explanation: `\`JOIN\` menggabungkan baris dari dua tabel berdasarkan kolom yang berhubungan (biasanya foreign key → primary key).

\`\`\`sql
SELECT u.name, d.name AS department
FROM users u
INNER JOIN departments d ON d.id = u.department_id;
\`\`\`

- \`u\` dan \`d\` adalah **alias** tabel agar query lebih pendek.
- \`ON\` menentukan kondisi penghubung.
- **INNER JOIN** hanya menampilkan baris yang punya pasangan di kedua tabel. User tanpa department tidak muncul.
- \`JOIN\` tanpa kata INNER artinya sama dengan INNER JOIN.

Lihat **Schema Viewer** di menu Database untuk melihat kolom penghubung antar tabel.`,
    example: `SELECT u.name, u.city, d.name AS department
FROM users u
INNER JOIN departments d ON d.id = u.department_id
ORDER BY d.name;`,
    practice: {
      task: "Tampilkan nama produk dan nama kategorinya (2 kolom: nama produk, nama kategori).",
      solution: `SELECT p.name, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id;`,
    },
    challengeIds: [10, 11],
  },
  {
    slug: "left-join",
    title: "LEFT JOIN",
    level: "intermediate",
    summary: "Mempertahankan semua baris dari tabel kiri.",
    dataset: "ecommerce",
    explanation: `\`LEFT JOIN\` menampilkan **semua baris dari tabel kiri**, walaupun tidak punya pasangan di tabel kanan. Kolom dari tabel kanan akan bernilai \`NULL\` jika tidak ada pasangannya.

Pola yang sangat berguna — mencari data yang **tidak punya** relasi:

\`\`\`sql
SELECT d.name
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
WHERE u.id IS NULL;
\`\`\`

Saat menghitung dengan LEFT JOIN, gunakan \`COUNT(kolom_kanan)\` bukan \`COUNT(*)\` agar baris tanpa pasangan dihitung 0.`,
    example: `SELECT d.name AS department, COUNT(u.id) AS jumlah_user
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
GROUP BY d.id, d.name
ORDER BY jumlah_user;`,
    practice: {
      task: "Tampilkan `name` user yang belum pernah melakukan order sama sekali.",
      solution: `SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL;`,
    },
    challengeIds: [12],
  },
  {
    slug: "right-join",
    title: "RIGHT JOIN",
    level: "intermediate",
    summary: "Mempertahankan semua baris dari tabel kanan.",
    dataset: "ecommerce",
    explanation: `\`RIGHT JOIN\` adalah kebalikan LEFT JOIN: **semua baris dari tabel kanan** tetap muncul.

\`\`\`sql
SELECT u.name, d.name
FROM users u
RIGHT JOIN departments d ON d.id = u.department_id;
\`\`\`

Setiap RIGHT JOIN bisa ditulis ulang sebagai LEFT JOIN dengan menukar posisi tabel, dan LEFT JOIN lebih umum dipakai. Namun kamu perlu mengenali RIGHT JOIN saat membaca query orang lain.

Ada juga \`FULL OUTER JOIN\` yang mempertahankan baris dari kedua sisi.`,
    example: `SELECT u.name AS user_name, d.name AS department
FROM users u
RIGHT JOIN departments d ON d.id = u.department_id
ORDER BY d.name;`,
    practice: {
      task: "Gunakan RIGHT JOIN untuk menampilkan setiap nama kategori beserta jumlah produknya — termasuk kategori tanpa produk (jumlahnya 0).",
      solution: `SELECT c.name, COUNT(p.id) AS jumlah FROM products p RIGHT JOIN categories c ON c.id = p.category_id GROUP BY c.id, c.name;`,
    },
    challengeIds: [],
  },
  {
    slug: "case",
    title: "CASE",
    level: "intermediate",
    summary: "Logika if-else di dalam query.",
    dataset: "ecommerce",
    explanation: `\`CASE\` membuat nilai berdasarkan kondisi, mirip if-else:

\`\`\`sql
CASE
  WHEN kondisi1 THEN hasil1
  WHEN kondisi2 THEN hasil2
  ELSE hasil_lain
END
\`\`\`

Kondisi dicek dari atas ke bawah, dan yang pertama bernilai benar yang dipakai.

CASE juga bisa dipakai di dalam agregat, misalnya menghitung jumlah per kondisi:

\`\`\`sql
SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)
\`\`\``,
    example: `SELECT name, stock,
  CASE
    WHEN stock = 0  THEN 'Habis'
    WHEN stock < 10 THEN 'Menipis'
    ELSE 'Aman'
  END AS status_stok
FROM products
ORDER BY stock;`,
    practice: {
      task: "Tampilkan `id`, `total`, dan kolom `kategori` dari tabel orders. `kategori` bernilai `besar` jika total >= 1000000, selain itu `kecil`.",
      solution: `SELECT id, total, CASE WHEN total >= 1000000 THEN 'besar' ELSE 'kecil' END AS kategori FROM orders;`,
    },
    challengeIds: [13],
  },
  {
    slug: "subquery",
    title: "Subquery",
    level: "intermediate",
    summary: "Query di dalam query.",
    dataset: "ecommerce",
    explanation: `**Subquery** adalah query yang ditulis di dalam query lain, di dalam tanda kurung.

Subquery bisa menghasilkan:

- **Satu nilai** — dipakai untuk perbandingan: \`WHERE price > (SELECT AVG(price) FROM products)\`
- **Satu kolom banyak baris** — dipakai dengan \`IN\`: \`WHERE id IN (SELECT user_id FROM orders)\`
- **Tabel** — dipakai di FROM sebagai tabel sementara.

Subquery dijalankan lebih dulu, lalu hasilnya dipakai oleh query luar.`,
    example: `SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY price DESC;`,
    practice: {
      task: "Tampilkan `name` user yang pernah memiliki order dengan status `cancelled` (gunakan subquery dengan IN).",
      solution: `SELECT name FROM users WHERE id IN (SELECT user_id FROM orders WHERE status = 'cancelled');`,
    },
    challengeIds: [14],
  },

  // ───────────── Advanced ─────────────
  {
    slug: "cte",
    title: "CTE",
    level: "advanced",
    summary: "Common Table Expression dengan WITH.",
    dataset: "ecommerce",
    explanation: `**CTE (Common Table Expression)** memberi nama pada sebuah subquery dengan \`WITH\`, sehingga query panjang lebih mudah dibaca.

\`\`\`sql
WITH nama_cte AS (
  SELECT ...
)
SELECT * FROM nama_cte;
\`\`\`

Kamu bisa membuat beberapa CTE sekaligus, dipisahkan koma, dan CTE berikutnya boleh memakai CTE sebelumnya:

\`\`\`sql
WITH a AS (...),
     b AS (SELECT ... FROM a)
SELECT * FROM b;
\`\`\``,
    example: `WITH belanja AS (
  SELECT user_id, SUM(total) AS total_belanja
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
)
SELECT u.name, b.total_belanja
FROM belanja b
JOIN users u ON u.id = b.user_id
ORDER BY b.total_belanja DESC
LIMIT 10;`,
    practice: {
      task: "Dengan CTE, hitung total belanja (`SUM(total)` dari semua order) per `user_id`, lalu tampilkan `user_id` dan totalnya hanya untuk yang totalnya lebih dari 15000000.",
      solution: `WITH t AS (SELECT user_id, SUM(total) AS total_belanja FROM orders GROUP BY user_id) SELECT user_id, total_belanja FROM t WHERE total_belanja > 15000000;`,
    },
    challengeIds: [15],
  },
  {
    slug: "union",
    title: "UNION",
    level: "advanced",
    summary: "Menggabungkan hasil beberapa query.",
    dataset: "inventory",
    explanation: `\`UNION\` menumpuk hasil dua query atau lebih menjadi satu hasil.

- \`UNION\` — menghapus baris duplikat.
- \`UNION ALL\` — mempertahankan semua baris (lebih cepat).

Syarat: setiap query harus punya **jumlah kolom yang sama** dengan tipe yang cocok. Nama kolom hasil diambil dari query pertama.

Lesson ini memakai dataset **Inventory**.`,
    example: `SELECT name, city, 'supplier' AS jenis FROM suppliers
UNION ALL
SELECT name, city, 'gudang' FROM warehouses
ORDER BY city;`,
    practice: {
      task: "Tampilkan daftar kota (tanpa duplikat) yang muncul di tabel `suppliers` atau `warehouses` dalam satu kolom.",
      solution: `SELECT city FROM suppliers UNION SELECT city FROM warehouses;`,
    },
    challengeIds: [16],
  },
  {
    slug: "exists",
    title: "EXISTS",
    level: "advanced",
    summary: "Mengecek keberadaan data terkait.",
    dataset: "ecommerce",
    explanation: `\`EXISTS (subquery)\` bernilai benar jika subquery menghasilkan **minimal satu baris**. \`NOT EXISTS\` kebalikannya.

Biasanya subquery di dalam EXISTS **berkorelasi** — merujuk ke tabel di query luar:

\`\`\`sql
SELECT u.name
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
\`\`\`

EXISTS berhenti mencari begitu menemukan satu baris cocok, dan aman terhadap nilai NULL (tidak seperti \`NOT IN\`).`,
    example: `-- produk yang belum pernah terjual
SELECT p.id, p.name
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);`,
    practice: {
      task: "Tampilkan `name` kategori yang memiliki minimal satu produk dengan stok kurang dari 10 (gunakan EXISTS).",
      solution: `SELECT c.name FROM categories c WHERE EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id AND p.stock < 10);`,
    },
    challengeIds: [17],
  },
  {
    slug: "window-function",
    title: "Window Function",
    level: "advanced",
    summary: "ROW_NUMBER, RANK, dan agregat berjalan.",
    dataset: "ecommerce",
    explanation: `**Window function** menghitung nilai berdasarkan sekelompok baris ("window") **tanpa menggabungkan baris** seperti GROUP BY.

\`\`\`sql
fungsi() OVER (PARTITION BY kolom ORDER BY kolom)
\`\`\`

- \`PARTITION BY\` — membagi data menjadi kelompok (opsional).
- \`ORDER BY\` — urutan di dalam kelompok.

Fungsi populer:

- \`ROW_NUMBER()\` — nomor urut 1, 2, 3, ...
- \`RANK()\` — peringkat, nilai sama dapat peringkat sama (1, 1, 3)
- \`DENSE_RANK()\` — seperti RANK tanpa lompatan (1, 1, 2)
- \`SUM(...) OVER (ORDER BY ...)\` — total berjalan (running total)
- \`LAG()\` / \`LEAD()\` — nilai baris sebelum / sesudah`,
    example: `SELECT name, category_id, price,
  ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS urutan
FROM products
ORDER BY category_id, urutan;`,
    practice: {
      task: "Tampilkan `name`, `category_id`, `price`, dan kolom `peringkat` = `RANK()` harga tertinggi di dalam setiap kategori.",
      solution: `SELECT name, category_id, price, RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS peringkat FROM products;`,
    },
    challengeIds: [18],
  },
  {
    slug: "index",
    title: "Index",
    level: "advanced",
    summary: "Mempercepat pencarian data.",
    dataset: "ecommerce",
    explanation: `**Index** mirip daftar isi buku: database bisa langsung menemukan baris yang dicari tanpa membaca seluruh tabel (full table scan).

\`\`\`sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
\`\`\`

Kapan membuat index:

- Kolom yang sering dipakai di \`WHERE\`, \`JOIN ... ON\`, dan \`ORDER BY\`.
- Kolom foreign key.

Kekurangan index: memakan ruang dan memperlambat INSERT/UPDATE/DELETE karena index juga harus diperbarui.

Gunakan \`EXPLAIN QUERY PLAN\` untuk melihat apakah query memakai index (\`USING INDEX\`) atau membaca seluruh tabel (\`SCAN\`).`,
    example: `CREATE INDEX idx_orders_user_id ON orders(user_id);

EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id = 5;`,
    practice: {
      task: "Buat index bernama `idx_products_category` pada kolom `category_id` di tabel `products`.",
      solution: `CREATE INDEX idx_products_category ON products(category_id);`,
      checkSql: `SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name = 'idx_products_category';`,
    },
    challengeIds: [],
  },
  {
    slug: "query-optimization",
    title: "Query Optimization",
    level: "advanced",
    summary: "Menulis query yang efisien.",
    dataset: "ecommerce",
    explanation: `Beberapa kebiasaan untuk query yang cepat dan mudah dirawat:

- **Ambil kolom yang dibutuhkan saja**, hindari \`SELECT *\` di aplikasi.
- **Filter sedini mungkin** dengan WHERE agar data yang diproses lebih sedikit.
- **Index kolom yang difilter dan di-JOIN.**
- **Jangan bungkus kolom ber-index dengan fungsi** di WHERE, misalnya \`WHERE UPPER(email) = ...\` membuat index tidak terpakai.
- **Gunakan LIMIT** saat hanya butuh sebagian data.
- **EXISTS** sering lebih efisien daripada \`IN\` dengan subquery besar.
- **Cek dengan EXPLAIN QUERY PLAN**: \`SCAN\` = membaca seluruh tabel, \`SEARCH ... USING INDEX\` = memakai index.`,
    example: `EXPLAIN QUERY PLAN
SELECT o.id, o.total
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE u.city = 'Bandung';`,
    practice: {
      task: "Tulis query efisien yang hanya menampilkan `id` dan `total` dari order milik user dengan `id` 1 yang berstatus `completed`.",
      solution: `SELECT id, total FROM orders WHERE user_id = 1 AND status = 'completed';`,
    },
    challengeIds: [],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsByLevel(level: Level): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}
