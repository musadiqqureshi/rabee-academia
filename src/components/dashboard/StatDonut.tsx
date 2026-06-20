interface Slice { label: string; value: number; color: string }

// Lightweight, dependency-free colorful donut chart with a legend.
export default function StatDonut({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
      <p className="text-sm font-semibold mb-4">{title}</p>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0 -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="16" />
          {total > 0 &&
            slices.map((s) => {
              const len = (s.value / total) * circ;
              const seg = (
                <circle
                  key={s.label}
                  cx="70" cy="70" r={radius} fill="none"
                  stroke={s.color} strokeWidth="16"
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return seg;
            })}
          <text x="70" y="70" transform="rotate(90 70 70)" textAnchor="middle" dominantBaseline="central"
            className="fill-foreground" style={{ fontSize: 22, fontWeight: 800 }}>
            {total}
          </text>
        </svg>
        <ul className="space-y-2 text-sm flex-1 min-w-0">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="truncate text-muted-foreground">{s.label}</span>
              </span>
              <span className="font-semibold">{s.value}</span>
            </li>
          ))}
          {total === 0 && <li className="text-muted-foreground text-xs">No data yet.</li>}
        </ul>
      </div>
    </div>
  );
}
