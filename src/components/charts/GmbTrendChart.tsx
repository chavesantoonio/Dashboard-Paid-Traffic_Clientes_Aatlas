"use client";

import { useTheme } from "next-themes";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface GmbDayData {
  date: string;
  discoveries: number;  // profile_views + search_queries
  interactions: number; // calls + directions_clicks + website_clicks
}

// ─── Cores GMB ────────────────────────────────────────────────────────────────
const GMB_GREEN  = "#34A853"; // verde Google
const DISC_COLOR = "#94a3b8"; // slate suave para descobertas (volume alto)

const TOUCH_SAFE: React.CSSProperties = {
  touchAction:        "none",
  userSelect:         "none",
  WebkitUserSelect:   "none",
  WebkitTouchCallout: "none",
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR").format(v);
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-semibold text-card-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-card-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GmbTrendChart({ data }: { data: GmbDayData[] }) {
  const { resolvedTheme } = useTheme();
  const isLight   = resolvedTheme === "light";
  const axisColor = isLight ? "#52525b" : "#71717a";
  const gridColor = isLight ? "#e4e4e7" : "#27272a";
  const legColor  = isLight ? "#52525b" : "#71717a";

  const fmt = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);

  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(8) + "/" + d.date.slice(5, 7),
  }));

  return (
    <div style={TOUCH_SAFE} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gmbDiscGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={DISC_COLOR} stopOpacity={0.2} />
              <stop offset="95%" stopColor={DISC_COLOR} stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="gmbIntGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={GMB_GREEN} stopOpacity={0.3} />
              <stop offset="95%" stopColor={GMB_GREEN} stopOpacity={0}   />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Y Esquerdo: Descobertas (valores maiores) */}
          <YAxis
            yAxisId="left"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={fmt}
          />

          {/* Y Direito: Interações (valores menores) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={36}
            tickFormatter={fmt}
          />

          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <Legend wrapperStyle={{ fontSize: 12, color: legColor, paddingTop: 8 }} />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="discoveries"
            name="Descobertas"
            stroke={DISC_COLOR}
            strokeWidth={2}
            fill="url(#gmbDiscGrad)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: DISC_COLOR, strokeWidth: 2, stroke: "#fff" }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="interactions"
            name="Interações"
            stroke={GMB_GREEN}
            strokeWidth={2}
            fill="url(#gmbIntGrad)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: GMB_GREEN, strokeWidth: 2, stroke: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
