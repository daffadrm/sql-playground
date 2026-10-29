// Copies the sql.js WASM build into public/ so the engine worker can load it
// without going through the bundler. Runs automatically before dev/build.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "sql.js", "dist");
const dest = join(root, "public", "sqljs");

mkdirSync(dest, { recursive: true });
for (const file of ["sql-wasm.js", "sql-wasm.wasm"]) {
  copyFileSync(join(src, file), join(dest, file));
}
console.log("sql.js copied to public/sqljs");
