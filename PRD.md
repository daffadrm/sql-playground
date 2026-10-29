# Product Requirements Document (PRD)

## 1. Informasi Produk

**Nama Produk:** SQL Learning Playground
**Versi:** MVP 1.0
**Platform:** Web Application
**Target:** Developer / mahasiswa / pemula yang ingin belajar SQL
**Mode:** Frontend-only untuk MVP
**Primary Color:** `#18397D`

---

# 2. Latar Belakang

Belajar SQL sering dilakukan dengan membaca materi dan mengerjakan soal secara terpisah dari database sebenarnya.

SQL Learning Playground dibuat sebagai platform belajar SQL yang memungkinkan pengguna:

- Mempelajari konsep SQL.
- Melihat struktur database.
- Menulis query SQL.
- Menjalankan query secara langsung.
- Melihat hasil query dalam bentuk tabel.
- Mengerjakan challenge SQL.
- Mendapatkan validasi terhadap hasil query.
- Melihat progress pembelajaran.

Tujuan utama MVP adalah memberikan pengalaman seperti **mini SQL client di browser**, tetapi sekaligus berfungsi sebagai platform pembelajaran.

---

# 3. Tujuan Produk

## 3.1 Primary Goal

Menyediakan lingkungan belajar SQL interaktif sehingga pengguna dapat belajar SQL dengan langsung menulis dan menjalankan query.

## 3.2 Secondary Goal

- Membantu pengguna memahami konsep SQL secara praktik.
- Memberikan latihan berdasarkan kasus nyata.
- Membantu pengguna memahami hubungan antar tabel.
- Menyediakan challenge dengan validasi otomatis.
- Menyimpan progress belajar secara lokal.

---

# 4. Target User

### Primary User

Developer pemula yang ingin meningkatkan kemampuan SQL.

### Secondary User

- Mahasiswa.
- Junior developer.
- Backend developer pemula.
- QA / tester.
- Data analyst pemula.
- Orang yang ingin latihan SQL untuk technical interview.

---

# 5. Scope MVP

MVP terdiri dari:

1. SQL Learning
2. SQL Playground
3. Database Explorer
4. SQL Challenge
5. Query Result
6. Query History
7. Progress Tracking
8. Local Storage

---

# 6. Fitur Utama

## 6.1 Dashboard

Dashboard menjadi halaman utama setelah aplikasi dibuka.

### Informasi

- Progress SQL.
- Materi terakhir yang dipelajari.
- Challenge terakhir.
- Jumlah query yang dijalankan.
- Jumlah challenge yang diselesaikan.

### Contoh

```text
SQL Learning Playground

Progress
████████████░░░░ 75%

Materi terakhir
JOIN

Challenge
12 / 20 completed

Queries Executed
148
```

---

# 7. SQL Learning

Menu untuk mempelajari konsep SQL secara bertahap.

## 7.1 Materi

### Beginner

1. Introduction to SQL
2. Database & Table
3. SELECT
4. WHERE
5. ORDER BY
6. LIMIT
7. DISTINCT
8. INSERT
9. UPDATE
10. DELETE

### Intermediate

11. Aggregate Function
12. GROUP BY
13. HAVING
14. INNER JOIN
15. LEFT JOIN
16. RIGHT JOIN
17. CASE
18. Subquery

### Advanced

19. CTE
20. UNION
21. EXISTS
22. Window Function
23. Index
24. Query Optimization

---

# 8. Struktur Materi

Setiap materi mempunyai struktur:

```text
Title
↓
Explanation
↓
Example
↓
Interactive Query
↓
Expected Result
↓
Practice
↓
Challenge
```

Contoh:

```text
## WHERE

WHERE digunakan untuk melakukan filtering
terhadap data.

Example:

SELECT *
FROM products
WHERE price > 10000;
```

User dapat langsung menekan:

**Try Query**

dan query dibuka di SQL Playground.

---

# 9. SQL Playground

Fitur utama aplikasi.

User dapat menulis dan menjalankan SQL secara langsung.

## 9.1 Layout

```text
┌───────────────────────────────────────────────┐
│ SQL Playground                                │
├───────────────┬───────────────────────────────┤
│ Database      │ SQL Editor                    │
│               │                               │
│ users         │ SELECT *                      │
│ products      │ FROM products;                │
│ orders        │                               │
│ order_items   │              [ Run ]          │
├───────────────┴───────────────────────────────┤
│ Query Result                                  │
│                                               │
│ id │ name        │ price                      │
│ 1  │ Product A   │ 15000                      │
│ 2  │ Product B   │ 25000                      │
└───────────────────────────────────────────────┘
```

---

# 10. SQL Editor

Editor digunakan untuk menulis SQL.

### Requirements

- Syntax highlighting.
- SQL autocomplete.
- Line number.
- Error highlighting.
- Format SQL.
- Clear query.
- Run query.
- Keyboard shortcut.

### Keyboard Shortcut

```text
Ctrl + Enter
```

untuk menjalankan query.

---

# 11. Database Explorer

Menampilkan database dan tabel yang tersedia.

Contoh:

```text
Database
│
├── users
│   ├── id
│   ├── name
│   ├── email
│   └── department_id
│
├── departments
│   ├── id
│   └── name
│
├── products
│   ├── id
│   ├── name
│   ├── price
│   └── stock
│
└── orders
    ├── id
    ├── user_id
    ├── total
    └── created_at
```

User dapat melakukan:

- Expand table.
- Melihat column.
- Melihat data type.
- Melihat primary key.
- Melihat foreign key.
- Preview data.

---

# 12. Schema Viewer

Menampilkan hubungan antar tabel.

Contoh:

```text
users
  │
  │ department_id
  ↓
departments


users
  │
  │ user_id
  ↓
orders
  │
  │ order_id
  ↓
order_items
```

Tujuannya membantu user memahami JOIN dan relasi database.

---

# 13. Query Execution

Query dijalankan langsung di browser.

### Engine

MVP menggunakan SQLite/WebAssembly atau SQL.js.

### Contoh

Input:

```sql
SELECT *
FROM products
WHERE stock < 10;
```

Output:

```text
┌────┬────────────┬───────┐
│ id │ name       │ stock │
├────┼────────────┼───────┤
│ 3  │ Product C  │ 5     │
│ 8  │ Product H  │ 7     │
└────┴────────────┴───────┘
```

---

# 14. Query Error

Jika query salah, aplikasi menampilkan error yang mudah dipahami.

Contoh:

```sql
SELECT name
FROM products
WHERE
```

Output:

```text
SQL Error

Syntax error near "WHERE".
```

Selain error dari SQL engine, aplikasi dapat memberikan hint sederhana.

Contoh:

```text
💡 Hint

WHERE membutuhkan kondisi/filter.

Contoh:

WHERE price > 10000
```

---

# 15. Query Result

Result table menampilkan hasil query.

Fitur:

- Pagination.
- Column resize.
- Copy cell.
- Copy row.
- Copy result.
- Sort result.
- Number of rows.
- Execution time.

Contoh:

```text
Result: 25 rows
Execution time: 12ms
```

---

# 16. SQL Challenge

User diberikan soal dan harus menulis query untuk menyelesaikannya.

Contoh:

### Challenge

> Tampilkan 5 produk dengan harga tertinggi.

Database:

```text
products
- id
- name
- price
- stock
```

User menulis:

```sql
SELECT *
FROM products
ORDER BY price DESC
LIMIT 5;
```

Klik:

**Run & Check**

---

# 17. Challenge Validation

Validasi tidak hanya berdasarkan string query.

Sistem membandingkan **hasil query** dengan expected result.

Contoh:

Expected:

```text
id | name | price
-----------------
5  | A    | 50000
3  | B    | 40000
```

Jika query berbeda tetapi menghasilkan result yang benar:

```sql
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 2;
```

tetap dapat dianggap benar selama sesuai dengan aturan challenge.

---

# 18. Challenge Level

### Easy

- SELECT
- WHERE
- ORDER BY
- LIMIT
- DISTINCT

### Medium

- JOIN
- GROUP BY
- HAVING
- CASE
- Subquery

### Hard

- CTE
- EXISTS
- Window Function
- Multiple JOIN
- Complex aggregation

---

# 19. Challenge Category

```text
SELECT
Filtering
Sorting
Aggregation
JOIN
Subquery
CTE
Window Function
Data Modification
```

---

# 20. Hint System

User dapat meminta hint.

Contoh:

### Hint 1

> Kamu membutuhkan JOIN.

### Hint 2

> Hubungkan `orders.user_id` dengan `users.id`.

### Hint 3

```sql
FROM orders o
JOIN users u
    ON u.id = o.user_id
```

Hint yang digunakan dapat mempengaruhi score challenge jika scoring diterapkan di masa depan.

---

# 21. Query History

Setiap query yang dijalankan dapat disimpan di LocalStorage.

Informasi:

```text
Query
Execution Time
Status
Timestamp
```

Contoh:

```text
SELECT *
FROM products;

✓ Success
12ms
2 minutes ago
```

User dapat mengklik history untuk membuka kembali query.

---

# 22. Favorite Query

User dapat menyimpan query favorit.

Contoh:

```text
⭐ Get Product Stock

SELECT
    name,
    stock
FROM products
ORDER BY stock ASC;
```

---

# 23. Progress Tracking

Progress disimpan menggunakan LocalStorage.

Informasi:

```text
SELECT          ✓
WHERE           ✓
ORDER BY        ✓
GROUP BY        ✓
JOIN            ✓
SUBQUERY        ○
CTE             ○
```

Dashboard:

```text
SQL Progress

Beginner       100%
Intermediate    65%
Advanced         0%
```

---

# 24. Dataset

MVP menyediakan dataset bawaan.

## Dataset 1 — E-Commerce

```text
users
departments
products
categories
orders
order_items
payments
```

## Dataset 2 — Inventory

```text
items
warehouses
stocks
stock_movements
suppliers
```

## Dataset 3 — Warehouse

```text
receiving
putaway
inventory
orders
picking
packing
shipping
```

Dataset warehouse dapat digunakan untuk challenge yang lebih realistis.

---

# 25. Seed Data

Setiap dataset mempunyai dummy data.

Contoh:

```text
products: 100 rows
users: 50 rows
orders: 200 rows
order_items: 500 rows
```

Data cukup banyak supaya query:

```sql
GROUP BY
JOIN
ORDER BY
COUNT
SUM
AVG
```

terasa seperti bekerja dengan database nyata.

---

# 26. Local Storage

Karena MVP tidak menggunakan backend, LocalStorage digunakan untuk:

```text
progress
completed lessons
completed challenges
query history
favorite queries
settings
```

Contoh:

```json
{
  "completedLessons": ["select", "where", "order-by"],
  "completedChallenges": [1, 2, 3]
}
```

---

# 27. Navigation

```text
Dashboard
│
├── Learn SQL
│   ├── Beginner
│   ├── Intermediate
│   └── Advanced
│
├── Playground
│
├── Challenges
│   ├── Easy
│   ├── Medium
│   └── Hard
│
├── Database
│   ├── E-Commerce
│   ├── Inventory
│   └── Warehouse
│
└── History
```

---

# 28. UI/UX

## Theme

Primary:

```text
#18397D
```

Secondary colors dapat digunakan untuk status:

```text
Success
Warning
Error
Info
```

## Design

- Clean.
- Developer-oriented.
- Responsive.
- Desktop-first.
- Dark mode optional.
- SQL editor menggunakan dark theme.
- Result table mudah dibaca.

---

# 29. Tech Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## SQL Editor

```text
Monaco Editor
```

## SQL Engine

```text
SQLite WASM / SQL.js
```

## State

```text
Zustand
```

## Storage

```text
LocalStorage / IndexedDB
```

Tidak membutuhkan backend pada MVP.

---

# 30. Architecture

```text
Browser
│
├── Next.js
│
├── React UI
│
├── Monaco Editor
│
├── SQL Engine
│   └── SQLite WASM
│
├── Dataset
│   └── Seed SQL / JSON
│
└── LocalStorage
    ├── Progress
    ├── History
    └── Favorites
```

Semua query dieksekusi di browser.

Tidak ada query yang dikirim ke server.

---

# 31. Security

Karena seluruh database berjalan di browser:

- Tidak ada database production.
- Tidak ada credential database.
- Tidak ada password database.
- Query user tidak dikirim ke server.
- Dataset hanya berupa dummy data.

Dengan demikian aplikasi aman untuk latihan SQL tanpa memberikan akses ke database sebenarnya.

---

# 32. MVP Acceptance Criteria

## Dashboard

- [ ] User dapat melihat progress.
- [ ] User dapat melihat lesson terakhir.
- [ ] User dapat melihat challenge progress.

## Learning

- [ ] User dapat membuka materi.
- [ ] User dapat melihat contoh SQL.
- [ ] User dapat membuka contoh ke Playground.
- [ ] Progress lesson tersimpan.

## Playground

- [ ] User dapat menulis SQL.
- [ ] User dapat menjalankan SQL.
- [ ] Query valid menghasilkan result.
- [ ] Query invalid menghasilkan error.
- [ ] User dapat melihat execution time.
- [ ] User dapat melihat jumlah row.
- [ ] User dapat melihat schema database.

## Challenge

- [ ] User dapat melihat soal.
- [ ] User dapat menjalankan query.
- [ ] User dapat melakukan check.
- [ ] Sistem dapat menentukan benar/salah.
- [ ] User dapat menggunakan hint.
- [ ] Challenge yang selesai tersimpan.

## History

- [ ] Query tersimpan.
- [ ] User dapat membuka kembali query.
- [ ] User dapat menghapus history.

---

# 33. Testing

## Functional Testing

### SQL Playground

**Test Case: Execute Valid Query**

Input:

```sql
SELECT * FROM products;
```

Expected:

- Query berhasil.
- Result table muncul.
- Row count muncul.
- Execution time muncul.

### Execute Invalid Query

Input:

```sql
SELECT FROM products;
```

Expected:

- Query gagal.
- Error ditampilkan.
- Application tidak crash.

### Empty Query

Expected:

```text
Please enter a SQL query.
```

---

## Challenge Testing

### Correct Query

Expected:

```text
✓ Correct!

Your query returned the expected result.
```

### Wrong Query

Expected:

```text
✗ Incorrect

The result does not match the expected result.
```

### Query Error

Expected:

```text
SQL Error

Please fix your query before checking.
```

---

# 34. Non-Functional Requirements

### Performance

- Initial application load < 3 detik pada koneksi normal.
- Query sederhana < 1 detik.
- UI tidak freeze ketika menjalankan query normal.

### Responsive

Minimum:

```text
Desktop
Tablet
Mobile
```

Untuk MVP, SQL Playground diprioritaskan untuk desktop.

### Availability

Aplikasi dapat digunakan tanpa backend.

---

# 35. Future Development

Setelah MVP berhasil, dapat ditambahkan:

## Backend

```text
FastAPI
PostgreSQL
```

Untuk:

- Account.
- Cloud progress.
- User profile.
- Leaderboard.
- Challenge management.
- Analytics.

## Authentication

```text
Login
Register
Google Login
```

## Advanced Challenge

- SQL interview.
- Timed challenge.
- Ranking.
- Score.
- Certification.

## Database Simulator

User dapat membuat database sendiri:

```sql
CREATE TABLE products (...);

INSERT INTO products (...);

SELECT * FROM products;
```

## Import Database

User dapat upload:

```text
.sql
.csv
```

kemudian menjalankan query terhadap data tersebut.

## AI SQL Assistant

Contoh:

> "Kenapa query saya salah?"

atau:

> "Buatkan query untuk mencari produk yang stoknya di bawah rata-rata."

AI memberikan penjelasan dan hint, bukan langsung memberikan jawaban jika sedang dalam Challenge Mode.

---

# 36. MVP Roadmap

### Phase 1 — Foundation

```text
Next.js
Tailwind
Layout
Navigation
Theme
```

### Phase 2 — SQL Engine

```text
SQLite WASM
Dataset
Schema
Query execution
Result table
Error handling
```

### Phase 3 — Learning

```text
Lesson
Example
Interactive query
Progress
```

### Phase 4 — Challenge

```text
Question
Query editor
Validation
Hint
Completion
```

### Phase 5 — Polish

```text
Query history
Favorites
Dashboard
Responsive
Empty states
Loading states
Error states
```

---

# 37. Definition of Done — MVP

MVP dianggap selesai apabila user dapat melakukan flow berikut:

```text
Open Application
       ↓
Dashboard
       ↓
Learn SQL
       ↓
Learn SELECT
       ↓
Try Example
       ↓
Open Playground
       ↓
Write SQL
       ↓
Run Query
       ↓
See Result
       ↓
Open Challenge
       ↓
Read Question
       ↓
Write SQL
       ↓
Run
       ↓
Check
       ↓
Correct
       ↓
Progress Updated
```

Dengan flow tersebut, **SQL Learning Playground sudah dapat digunakan sebagai aplikasi belajar SQL secara mandiri tanpa backend**.
