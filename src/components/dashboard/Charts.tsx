import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ChartPoint {
  label: string;
  value: number;
}

/** Vertical bar chart rendered with plain divs — fully responsive. */
export function BarChart({ data, height = 180 }: { data: ChartPoint[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
            <span className="text-[11px] font-semibold text-slate-500">{d.value}</span>
            <div
              className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all"
              style={{ height: `${Math.max(4, (d.value / max) * (height - 40))}px` }}
              role="img"
              aria-label={`${d.label}: ${d.value}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((d) => (
          <div key={d.label} className="min-w-0 flex-1 truncate text-center text-[11px] text-slate-400">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Smooth area/line chart in SVG. */
export function AreaChart({ data, height = 200 }: { data: ChartPoint[]; height?: number }) {
  const W = 600;
  const H = 220;
  const PAD = 8;
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">No data</p>;
  }

  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => ({
    x: PAD + i * stepX,
    y: H - PAD - (d.value / max) * (H - PAD * 2 - 20),
  }));

  const line = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`;

  return (
    <div className="w-full" style={{ maxHeight: height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Area chart">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + f * (H - PAD * 2)}
            y2={PAD + f * (H - PAD * 2)}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#0891b2" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1">
        {data.map((d) => (
          <span key={d.label} className="text-[11px] text-slate-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const DONUT_COLORS = ["#06b6d4", "#0891b2", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

/** Donut chart for distribution data. */
export function DonutChart({
  data,
  size = 170,
}: {
  data: ChartPoint[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const dashes = data.map((d) => (total > 0 ? (d.value / total) * circumference : 0));
  const segments = data.map((d, i) => ({
    label: d.label,
    value: d.value,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
    dash: dashes[i],
    // Running sum of every dash before this one.
    offset: dashes.slice(0, i).reduce((sum, x) => sum + x, 0),
  }));

  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <svg width={size} height={size} viewBox="0 0 160 160" role="img" aria-label="Distribution donut chart">
        <g transform="rotate(-90 80 80)">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="22" />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text x="80" y="76" textAnchor="middle" className="fill-slate-900 text-xl font-bold" style={{ fontSize: 24 }}>
          {total}
        </text>
        <text x="80" y="96" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 11 }}>
          Total
        </text>
      </svg>
      <ul className="space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className="text-slate-600">{s.label}</span>
            <span className="font-semibold text-slate-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
