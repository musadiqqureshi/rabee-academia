// Reliable "Print / Save as PDF" for a single result element.
//
// The old approach hid the whole page with `@media print { visibility:hidden }`
// and absolutely-positioned the result — browsers clip absolutely-positioned
// content to ONE page, so multi-page papers/results came out blank or cut off.
//
// Instead we clone just the result element into a fresh document and print that.
// Triggered from a click handler, so it counts as a user gesture (not blocked).
export function printArea(elementId: string, title: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(elementId);
  if (!el) return;

  const win = window.open("", "_blank", "width=820,height=1040");
  if (!win) {
    alert("Please allow pop-ups for this site to print or save as PDF.");
    return;
  }

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #000; background: #fff; margin: 32px; line-height: 1.6; font-size: 14px; }
    h1, h2, h3, h4 { margin: 0.9em 0 0.4em; line-height: 1.25; }
    p { margin: 0.5em 0; }
    ul, ol { margin: 0.5em 0; padding-left: 1.4em; }
    table { border-collapse: collapse; width: 100%; margin: 0.6em 0; }
    th, td { border: 1px solid rgba(0,0,0,0.45); padding: 6px 8px; vertical-align: top; }
    th { background: rgba(0,0,0,0.05); text-align: left; }
    img { max-width: 100%; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    @page { margin: 16mm; }
  </style>
</head>
<body>${el.innerHTML}</body>
</html>`);
  win.document.close();
  win.focus();

  // Let the new document lay out (and load images) before printing.
  const fire = () => { win.print(); win.close(); };
  if (win.document.readyState === "complete") setTimeout(fire, 350);
  else win.onload = () => setTimeout(fire, 350);
}
