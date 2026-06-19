"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Lightweight rich-text editor (contenteditable) with a small formatting
 * toolbar. Emits HTML. Used for in-portal assignment submissions.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your answer…",
  disabled = false,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Seed the initial HTML once (uncontrolled thereafter to preserve caret).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (command: string, arg?: string) => {
    if (disabled) return;
    document.execCommand(command, false, arg);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? "");
  };

  const tools = [
    { icon: Bold, cmd: "bold", label: "Bold" },
    { icon: Italic, cmd: "italic", label: "Italic" },
    { icon: Underline, cmd: "underline", label: "Underline" },
    { icon: List, cmd: "insertUnorderedList", label: "Bullet list" },
    { icon: ListOrdered, cmd: "insertOrderedList", label: "Numbered list" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5 bg-muted/40">
        {tools.map(({ icon: Icon, cmd, label }) => (
          <button
            key={cmd}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(e) => {
              e.preventDefault();
              exec(cmd);
            }}
            className="p-1.5 rounded-md text-foreground/70 hover:bg-background hover:text-primary transition-colors disabled:opacity-40"
            disabled={disabled}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("Link URL");
            if (url) exec("createLink", url);
          }}
          className="p-1.5 rounded-md text-foreground/70 hover:bg-background hover:text-primary transition-colors disabled:opacity-40"
          disabled={disabled}
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable={!disabled}
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className="prose prose-sm max-w-none min-h-[180px] px-4 py-3 outline-none text-sm leading-relaxed focus:ring-0"
        suppressContentEditableWarning
      />
    </div>
  );
}
