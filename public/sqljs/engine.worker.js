/* global initSqlJs */
// SQL engine worker. Runs sql.js (SQLite compiled to WASM) off the main thread
// so long queries never freeze the UI. Nothing here talks to a server.
//
// Protocol: postMessage({ id, type, ...payload }) -> { id, ok: true, data } | { id, ok: false, error }

importScripts("sql-wasm.js");

const sqlReady = initSqlJs({ locateFile: (file) => file });

/** @type {Map<string, { db: any, seed: Uint8Array }>} */
const databases = new Map();

// Runs every statement in `sql` and returns the last result set. Unlike
// db.exec, a SELECT that matches zero rows still yields its column names.
function run(db, sql) {
  let last = null;
  let statementsWithRows = 0;
  const changesBefore = totalChanges(db);
  for (const stmt of db.iterateStatements(sql)) {
    try {
      const columns = stmt.getColumnNames();
      if (columns.length > 0) {
        const rows = [];
        while (stmt.step()) rows.push(stmt.get());
        last = { columns, rows };
        statementsWithRows++;
      } else {
        stmt.step();
      }
    } finally {
      stmt.free();
    }
  }
  return {
    columns: last ? last.columns : [],
    rows: last ? last.rows : [],
    statementsWithRows,
    rowsModified: totalChanges(db) - changesBefore,
  };
}

function totalChanges(db) {
  return db.exec("SELECT total_changes()")[0].values[0][0];
}

function fresh(SQL, key) {
  const entry = databases.get(key);
  if (!entry) throw new Error(`Dataset "${key}" belum dimuat.`);
  return new SQL.Database(entry.seed);
}

function readSchema(db) {
  const tables = db.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid",
  );
  if (tables.length === 0) return [];
  return tables[0].values.map(([name]) => {
    const quoted = `"${String(name).replace(/"/g, '""')}"`;
    const info = db.exec(`PRAGMA table_info(${quoted})`);
    const fks = db.exec(`PRAGMA foreign_key_list(${quoted})`);
    const count = db.exec(`SELECT COUNT(*) FROM ${quoted}`);
    const fkByColumn = new Map();
    if (fks.length > 0) {
      const cols = fks[0].columns;
      for (const row of fks[0].values) {
        const r = Object.fromEntries(cols.map((c, i) => [c, row[i]]));
        fkByColumn.set(r.from, { table: r.table, column: r.to });
      }
    }
    const columns =
      info.length === 0
        ? []
        : info[0].values.map((row) => {
            const r = Object.fromEntries(info[0].columns.map((c, i) => [c, row[i]]));
            return {
              name: r.name,
              type: r.type || "ANY",
              notNull: r.notnull === 1,
              primaryKey: r.pk > 0,
              foreignKey: fkByColumn.get(r.name) || null,
            };
          });
    return { name, columns, rowCount: count[0].values[0][0] };
  });
}

const handlers = {
  async load(SQL, { key, seedSql }) {
    if (databases.has(key)) databases.get(key).db.close();
    const db = new SQL.Database();
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(seedSql);
    databases.set(key, { db, seed: db.export() });
    // export() resets PRAGMAs on some builds; re-enable for the live db.
    db.exec("PRAGMA foreign_keys = ON;");
    return readSchema(db);
  },

  async reset(SQL, { key }) {
    const entry = databases.get(key);
    if (!entry) throw new Error(`Dataset "${key}" belum dimuat.`);
    entry.db.close();
    entry.db = new SQL.Database(entry.seed);
    entry.db.exec("PRAGMA foreign_keys = ON;");
    return readSchema(entry.db);
  },

  async schema(SQL, { key }) {
    const entry = databases.get(key);
    if (!entry) throw new Error(`Dataset "${key}" belum dimuat.`);
    return readSchema(entry.db);
  },

  async exec(SQL, { key, sql }) {
    const entry = databases.get(key);
    if (!entry) throw new Error(`Dataset "${key}" belum dimuat.`);
    const started = performance.now();
    const result = run(entry.db, sql);
    return { ...result, timeMs: performance.now() - started };
  },

  // Runs statements against a throwaway copy of the seed data. Used for lesson
  // previews and challenge checking so the user's playground db is untouched.
  async scratch(SQL, { key, sql, checkSql }) {
    const db = fresh(SQL, key);
    try {
      db.exec("PRAGMA foreign_keys = ON;");
      const started = performance.now();
      let result = run(db, sql);
      if (checkSql) result = run(db, checkSql);
      return { ...result, timeMs: performance.now() - started };
    } finally {
      db.close();
    }
  },
};

self.onmessage = async (event) => {
  const { id, type, ...payload } = event.data;
  try {
    const SQL = await sqlReady;
    const handler = handlers[type];
    if (!handler) throw new Error(`Unknown message type: ${type}`);
    const data = await handler(SQL, payload);
    self.postMessage({ id, ok: true, data });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err && err.message ? err.message : String(err) });
  }
};
