import React from "react";
import katex from "katex";

// Minimal, safe markdown renderer (no heavy deps). Handles headings, bold,
// italic, inline code, code blocks, bullet/numbered lists, GFM tables, LaTeX
// math (KaTeX) and paragraphs — enough to render AI answers cleanly.

// Render a LaTeX string to KaTeX HTML. throwOnError keeps a bad expression from
// crashing the whole answer; it falls back to the raw TeX instead.
function mathHtml(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode: display,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return tex;
  }
}

function MathSpan({ tex, display }: { tex: string; display: boolean }) {
  const html = mathHtml(tex, display);
  return display ? (
    <div className="my-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Order matters: match inline math (\(…\) and $$…$$) before other tokens so
  // markdown characters inside the TeX are not mis-parsed.
  const regex = /(\\\([\s\S]+?\\\)|\$\$[\s\S]+?\$\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);
  parts.forEach((p, i) => {
    if (!p) return;
    const key = `${keyBase}-${i}`;
    if (p.startsWith("\\(") && p.endsWith("\\)")) {
      nodes.push(<MathSpan key={key} tex={p.slice(2, -2)} display={false} />);
    } else if (p.startsWith("$$") && p.endsWith("$$")) {
      nodes.push(<MathSpan key={key} tex={p.slice(2, -2)} display={false} />);
    } else if (p.startsWith("**") && p.endsWith("**")) {
      nodes.push(<strong key={key}>{p.slice(2, -2)}</strong>);
    } else if (p.startsWith("*") && p.endsWith("*")) {
      nodes.push(<em key={key}>{p.slice(1, -1)}</em>);
    } else if (p.startsWith("`") && p.endsWith("`")) {
      nodes.push(<code key={key} className="px-1 py-0.5 rounded bg-foreground/10 text-[0.85em] font-mono">{p.slice(1, -1)}</code>);
    } else {
      nodes.push(<React.Fragment key={key}>{p}</React.Fragment>);
    }
  });
  return nodes;
}

function splitRow(row: string): string[] {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}
const isSepRow = (cells: string[]) => cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c.replace(/\s/g, "")));

export default function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;
  let table: string[] | null = null;
  // Display-math accumulator. `close` is the delimiter that ends the block.
  let math: { lines: string[]; close: string } | null = null;

  const flushList = (key: string) => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={key} className={`${list.ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1 my-2`}>
        {list.items.map((it, i) => <li key={i}>{renderInline(it, `${key}-${i}`)}</li>)}
      </Tag>,
    );
    list = null;
  };

  const flushTable = (key: string) => {
    if (!table || table.length === 0) { table = null; return; }
    const rows = table.map(splitRow);
    const header = rows[0];
    const body = rows.slice(1).filter((r) => !isSepRow(r));
    blocks.push(
      <div key={key} className="my-2 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>{header.map((c, i) => <th key={i} className="border border-border px-2.5 py-1.5 text-left bg-muted/60 font-semibold">{renderInline(c, `${key}-h-${i}`)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className="odd:bg-muted/20">
                {header.map((_, ci) => <td key={ci} className="border border-border px-2.5 py-1.5 align-top">{renderInline(r[ci] ?? "", `${key}-${ri}-${ci}`)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    // Display math block (\[ … \] or $$ … $$), possibly spanning many lines.
    if (math) {
      if (trimmed === math.close || trimmed.endsWith(math.close)) {
        const tail = trimmed === math.close ? "" : trimmed.slice(0, -math.close.length);
        if (tail) math.lines.push(tail);
        blocks.push(<MathSpan key={`math-${idx}`} tex={math.lines.join("\n")} display />);
        math = null;
      } else {
        math.lines.push(raw);
      }
      return;
    }
    // One-line display math, e.g. "\[ … \]" or "$$ … $$".
    const oneLine = /^\\\[([\s\S]*)\\\]$/.exec(trimmed) || /^\$\$([\s\S]+)\$\$$/.exec(trimmed);
    if (oneLine && oneLine[1].trim()) {
      flushList(`l-${idx}`); flushTable(`t-${idx}`);
      blocks.push(<MathSpan key={`math-${idx}`} tex={oneLine[1]} display />);
      return;
    }
    // Opening of a multi-line display-math block.
    if (trimmed === "\\[" || trimmed.startsWith("\\[")) {
      flushList(`l-${idx}`); flushTable(`t-${idx}`);
      math = { lines: trimmed === "\\[" ? [] : [trimmed.slice(2)], close: "\\]" };
      return;
    }
    if (trimmed === "$$") {
      flushList(`l-${idx}`); flushTable(`t-${idx}`);
      math = { lines: [], close: "$$" };
      return;
    }

    // Code fences
    if (line.trim().startsWith("```")) {
      if (code) {
        blocks.push(<pre key={`code-${idx}`} className="my-2 p-3 rounded-lg bg-foreground/10 overflow-x-auto text-xs font-mono"><code>{code.join("\n")}</code></pre>);
        code = null;
      } else { flushList(`l-${idx}`); flushTable(`t-${idx}`); code = []; }
      return;
    }
    if (code) { code.push(raw); return; }

    // Table rows (lines that look like | a | b |)
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushList(`l-${idx}`);
      (table ??= []).push(line);
      return;
    }
    if (table) flushTable(`t-${idx}`);

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);

    if (h) {
      flushList(`l-${idx}`);
      const sizes = ["text-lg", "text-base", "text-sm", "text-sm"];
      blocks.push(<p key={`h-${idx}`} className={`font-bold ${sizes[h[1].length - 1]} mt-3 mb-1`}>{renderInline(h[2], `h-${idx}`)}</p>);
    } else if (bullet) {
      if (!list || list.ordered) { flushList(`l-${idx}`); list = { ordered: false, items: [] }; }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) { flushList(`l-${idx}`); list = { ordered: true, items: [] }; }
      list.items.push(numbered[1]);
    } else if (line.trim() === "") {
      flushList(`l-${idx}`);
    } else {
      flushList(`l-${idx}`);
      blocks.push(<p key={`p-${idx}`} className="my-1.5">{renderInline(line, `p-${idx}`)}</p>);
    }
  });

  flushList("l-end");
  const mathTail = math as { lines: string[]; close: string } | null;
  if (mathTail && mathTail.lines.length) blocks.push(<MathSpan key="math-end" tex={mathTail.lines.join("\n")} display />);
  const tableTail = table as string[] | null;
  if (tableTail) flushTable("t-end");
  const codeTail = code as string[] | null;
  if (codeTail) blocks.push(<pre key="code-end" className="my-2 p-3 rounded-lg bg-foreground/10 overflow-x-auto text-xs font-mono"><code>{codeTail.join("\n")}</code></pre>);

  return <div className="text-sm leading-relaxed">{blocks}</div>;
}
