import React from "react";

// Minimal, safe markdown renderer (no external deps). Handles headings, bold,
// italic, inline code, code blocks, bullet/numbered lists and paragraphs — enough
// to render AI answers cleanly instead of showing raw markdown symbols.

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);
  parts.forEach((p, i) => {
    if (!p) return;
    if (p.startsWith("**") && p.endsWith("**")) {
      nodes.push(<strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>);
    } else if (p.startsWith("*") && p.endsWith("*")) {
      nodes.push(<em key={`${keyBase}-${i}`}>{p.slice(1, -1)}</em>);
    } else if (p.startsWith("`") && p.endsWith("`")) {
      nodes.push(
        <code key={`${keyBase}-${i}`} className="px-1 py-0.5 rounded bg-foreground/10 text-[0.85em] font-mono">{p.slice(1, -1)}</code>,
      );
    } else {
      nodes.push(<React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>);
    }
  });
  return nodes;
}

export default function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;

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

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    // Code fences
    if (line.trim().startsWith("```")) {
      if (code) {
        blocks.push(
          <pre key={`code-${idx}`} className="my-2 p-3 rounded-lg bg-foreground/10 overflow-x-auto text-xs font-mono"><code>{code.join("\n")}</code></pre>,
        );
        code = null;
      } else { flushList(`l-${idx}`); code = []; }
      return;
    }
    if (code) { code.push(raw); return; }

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
  const codeTail = code as string[] | null;
  if (codeTail) blocks.push(<pre key="code-end" className="my-2 p-3 rounded-lg bg-foreground/10 overflow-x-auto text-xs font-mono"><code>{codeTail.join("\n")}</code></pre>);

  return <div className="text-sm leading-relaxed">{blocks}</div>;
}
