"use client";

import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface Ga4DayData {
  date: string;
  sessions: number;
  engaged_sessions: number;
}

// ─── Cores ────────────────────────────────────────────────────────────────────
const GA4_BLUE   = "#4285F4"; // azul Google — sessões engajadas (frente)
const NEUTRAL    = "#94a3b8"; // slate — sessões totais (fundo)

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
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-card-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function Ga4QualityChart({ data }: { data: Ga4DayData[] }) {
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
        <AreaChart
          data={formatted}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Fundo: sessões totais — neutro e transparente */}
            <linearGradient id="ga4SessionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={NEUTRAL}  stopOpacity={0.18} />
              <stop offset="95%" stopColor={NEUTRAL}  stopOpacity={0}    />
            </linearGradient>
            {/* Frente: sessões engajadas — vibrante */}
            <linearGradient id="ga4EngagedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={GA4_BLUE} stopOpacity={0.35} />
              <stop offset="95%" stopColor={GA4_BLUE} stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={fmt}
          />

          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <Legend wrapperStyle={{ fontSize: 12, color: legColor, paddingTop: 8 }} />

          {/* Área de fundo: sessões totais */}
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessões Totais"
            stroke={NEUTRAL}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="url(#ga4SessionsGrad)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: NEUTRAL, strokeWidth: 2, stroke: "#fff" }}
          />

          {/* Área de frente: sessões engajadas */}
          <Area
            type="monotone"
            dataKey="engaged_sessions"
            name="Sessões Engajadas"
            stroke={GA4_BLUE}
            strokeWidth={2}
            fill="url(#ga4EngagedGrad)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: GA4_BLUE, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
