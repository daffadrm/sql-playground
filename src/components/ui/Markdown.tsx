import { Fragment, type ReactNode } from "react";

// Minimal renderer for lesson/challenge text: paragraphs, "- " lists,
// ```sql fenced blocks, `inline code`, and **bold**. Content is our own.

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100">
      <code>{code}</code>
    </pre>
  );
}

export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const parts = text.split(/```(?:sql)?\n([\s\S]*?)```/g);
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      blocks.push(<CodeBlock key={`c${i}`} code={part.trimEnd()} />);
      return;
    }
    part
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((para, j) => {
        const lines = para.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          blocks.push(
            <ul key={`${i}-${j}`}>
              {lines.map((l, k) => (
                <li key={k}>{inline(l.slice(2))}</li>
              ))}
            </ul>,
          );
        } else {
          blocks.push(<p key={`${i}-${j}`}>{inline(para)}</p>);
        }
      });
  });
  return <div className={`prose-lesson text-[15px] text-slate-700 ${className}`}>{blocks}</div>;
}
