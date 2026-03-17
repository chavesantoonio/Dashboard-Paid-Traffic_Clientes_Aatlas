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

export interface MetaAdsDayData {
  date: string;
  spend: number;
  messages_started: number;
}

// ─── Cores Meta ───────────────────────────────────────────────────────────────
const META_BLUE    = "#1877F2";
const BRAND_ORANGE = "#FF6200";

// ─── Estilos anti-seleção mobile ─────────────────────────────────────────────
// touch-action:none  → impede o browser de interceptar o toque para scroll,
//                      mantendo as coordenadas corretas para o recharts
// user-select:none   → impede seleção de texto ao arrastar o dedo
// WebkitTouchCallout → remove o menu de contexto iOS no toque longo
const TOUCH_SAFE: React.CSSProperties = {
  touchAction:          "none",
  userSelect:           "none",
  WebkitUserSelect:     "none",
  WebkitTouchCallout:   "none",
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

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
          <span className="font-bold text-card-foreground">
            {p.name === "Investimento"
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                }).format(p.value)
              : new Intl.NumberFormat("pt-BR").format(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function MetaAdsTrendChart({ data }: { data: MetaAdsDayData[] }) {
  const { resolvedTheme } = useTheme();
  const isLight     = resolvedTheme === "light";
  const axisColor   = isLight ? "#52525b" : "#71717a";
  const gridColor   = isLight ? "#e4e4e7" : "#27272a";
  const legendColor = isLight ? "#52525b" : "#71717a";

  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(8) + "/" + d.date.slice(5, 7),
  }));

  return (
    // Wrapper com touch-action:none garante que o recharts recebe as
    // coordenadas corretas no mobile — sem isso o activeDot desincroniza
    <div style={TOUCH_SAFE} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={formatted}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="metaSpendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={BRAND_ORANGE} stopOpacity={0.25} />
              <stop offset="95%" stopColor={BRAND_ORANGE} stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="metaMsgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={META_BLUE} stopOpacity={0.3} />
              <stop offset="95%" stopColor={META_BLUE} stopOpacity={0}   />
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
            yAxisId="left"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) =>
              v >= 1000 ? `R$${(v / 1000).toFixed(0)}K` : `R$${v}`
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={40}
          />

          {/* isAnimationActive:false → resposta imediata ao toque no mobile */}
          <Tooltip
            content={<CustomTooltip />}
            isAnimationActive={false}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: legendColor, paddingTop: 8 }} />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="spend"
            name="Investimento"
            stroke={BRAND_ORANGE}
            strokeWidth={2}
            fill="url(#metaSpendGrad)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: BRAND_ORANGE, strokeWidth: 2, stroke: "#fff" }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="messages_started"
            name="Mensagens"
            stroke={META_BLUE}
            strokeWidth={2}
            fill="url(#metaMsgGrad)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: META_BLUE, strokeWidth: 2, stroke: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
