"use client";

import Editor, { type BeforeMount, type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { format } from "sql-formatter";
import { errorToken } from "@/lib/sql/errorHints";
import type { TableInfo } from "@/lib/sql/types";
import { Spinner } from "@/components/ui/primitives";

type EditorInstance = Parameters<OnMount>[0];

const KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL", "LIKE", "BETWEEN", "AS", "DISTINCT",
  "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "ASC", "DESC", "JOIN", "INNER JOIN", "LEFT JOIN",
  "RIGHT JOIN", "FULL OUTER JOIN", "ON", "UNION", "UNION ALL", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END",
  "WITH", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE INDEX", "EXPLAIN QUERY PLAN", "OVER",
  "PARTITION BY",
];
const FUNCTIONS = [
  "COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND", "COALESCE", "UPPER", "LOWER", "LENGTH", "SUBSTR", "IFNULL",
  "ROW_NUMBER", "RANK", "DENSE_RANK", "LAG", "LEAD", "julianday", "strftime", "date", "datetime",
];

// One completion provider serves every editor; each model looks up its own schema.
const schemaByModel = new Map<string, TableInfo[]>();
let providerRegistered = false;

function registerCompletion(monaco: Monaco) {
  if (providerRegistered) return;
  providerRegistered = true;
  monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: ["."],
    provideCompletionItems(model, position) {
      const schema = schemaByModel.get(model.uri.toString()) ?? [];
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const K = monaco.languages.CompletionItemKind;

      // "alias." -> only that table's columns
      const before = model.getLineContent(position.lineNumber).slice(0, word.startColumn - 1);
      const dotted = /(\w+)\.$/.exec(before);
      if (dotted) {
        const text = model.getValue();
        const aliases = new Map<string, string>();
        for (const m of text.matchAll(/\b(?:from|join)\s+(\w+)(?:\s+(?:as\s+)?(\w+))?/gi)) {
          aliases.set(m[1].toLowerCase(), m[1]);
          if (m[2]) aliases.set(m[2].toLowerCase(), m[1]);
        }
        const tableName = aliases.get(dotted[1].toLowerCase()) ?? dotted[1];
        const table = schema.find((t) => t.name.toLowerCase() === tableName.toLowerCase());
        return {
          suggestions: (table?.columns ?? []).map((c) => ({
            label: c.name,
            kind: K.Field,
            detail: `${table!.name}.${c.name} · ${c.type}`,
            insertText: c.name,
            range,
          })),
        };
      }

      const columns = new Map<string, string[]>();
      for (const t of schema) for (const c of t.columns) columns.set(c.name, [...(columns.get(c.name) ?? []), t.name]);

      return {
        suggestions: [
          ...KEYWORDS.map((k) => ({ label: k, kind: K.Keyword, insertText: k, range, sortText: `3${k}` })),
          ...FUNCTIONS.map((f) => ({ label: f, kind: K.Function, insertText: `${f}($0)`, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, sortText: `2${f}` })),
          ...schema.map((t) => ({ label: t.name, kind: K.Struct, detail: `table · ${t.rowCount} rows`, insertText: t.name, range, sortText: `0${t.name}` })),
          ...[...columns.entries()].map(([name, tables]) => ({ label: name, kind: K.Field, detail: tables.join(", "), insertText: name, range, sortText: `1${name}` })),
        ],
      };
    },
  });
}

export function formatSql(sql: string): string {
  return format(sql, { language: "sqlite", keywordCase: "upper", tabWidth: 2 });
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  onFormat?: () => void;
  schema?: TableInfo[];
  /** Error message from the engine; the offending token gets a red squiggle. */
  error?: string | null;
  height?: string | number;
  readOnly?: boolean;
}

export function SqlEditor({ value, onChange, onRun, onFormat, schema = [], error, height = "100%", readOnly = false }: Props) {
  const editorRef = useRef<EditorInstance | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const runRef = useRef(onRun);
  const formatRef = useRef(onFormat);
  const schemaRef = useRef(schema);

  useEffect(() => {
    runRef.current = onRun;
    formatRef.current = onFormat;
    schemaRef.current = schema;
    const model = editorRef.current?.getModel();
    if (model) schemaByModel.set(model.uri.toString(), schema);
  });

  const beforeMount: BeforeMount = (monaco) => registerCompletion(monaco);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const model = editor.getModel();
    if (model) schemaByModel.set(model.uri.toString(), schemaRef.current);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => formatRef.current?.());
    editor.onDidDispose(() => {
      if (model) schemaByModel.delete(model.uri.toString());
    });
  };

  // Error highlighting
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monaco || !model) return;
    if (!error) {
      monaco.editor.setModelMarkers(model, "sql", []);
      return;
    }
    const token = errorToken(error);
    const match = token ? model.findMatches(token, false, false, false, null, false)[0] : undefined;
    const lastLine = model.getLineCount();
    const range = match?.range ?? {
      startLineNumber: lastLine,
      startColumn: 1,
      endLineNumber: lastLine,
      endColumn: model.getLineMaxColumn(lastLine),
    };
    monaco.editor.setModelMarkers(model, "sql", [{ ...range, message: error, severity: monaco.MarkerSeverity.Error }]);
  }, [error]);

  return (
    <Editor
      height={height}
      language="sql"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      beforeMount={beforeMount}
      onMount={onMount}
      loading={
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Memuat editor…
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        tabSize: 2,
        padding: { top: 12, bottom: 12 },
        fixedOverflowWidgets: true,
        renderLineHighlight: "line",
        readOnly,
        quickSuggestions: { other: true, comments: false, strings: false },
      }}
    />
  );
}
