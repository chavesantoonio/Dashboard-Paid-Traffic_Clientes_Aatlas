"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface Ga4FunnelStage {
  stage: string;
  value: number;
}

// ─── Cores por estágio ────────────────────────────────────────────────────────
const STAGE_COLORS = [
  "#94a3b8", // Sessões Totais    — slate neutro
  "#4285F4", // Sessões Engajadas — azul Google
  "#25D366", // Cliques WhatsApp  — verde WhatsApp
];

// ─── Formatador ───────────────────────────────────────────────────────────────

function formatVal(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("pt-BR").format(v);
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { dataKey: string; payload: { stage: string; val: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload.find((p) => p.dataKey === "val");
  if (!item) return null;
  const { stage, val } = item.payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-card-foreground">{stage}</p>
      <p className="mt-0.5 font-bold text-card-foreground">
        {new Intl.NumberFormat("pt-BR").format(val)}
      </p>
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function Ga4RetentionFunnel({ data }: { data: Ga4FunnelStage[] }) {
  const { resolvedTheme } = useTheme();
  const isLight    = resolvedTheme === "light";
  const axisColor  = isLight ? "#52525b" : "#9ca3af";
  const labelColor = isLight ? "#52525b" : "#9ca3af";
  const cursorFill = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  // Padding simétrico para efeito funil centralizado
  const chartData = data.map((d) => ({
    stage: d.stage,
    val:   d.value,
    pad:   (maxVal - d.value) / 2,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 56, left: 0, bottom: 4 }}
        barCategoryGap="28%"
      >
        <XAxis type="number" domain={[0, maxVal]} hide />
        <YAxis
          type="category"
          dataKey="stage"
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />

        {/* Padding invisível — centraliza a barra real */}
        <Bar dataKey="pad" stackId="f" fill="transparent" legendType="none" />

        {/* Barra real — cor por estágio */}
        <Bar dataKey="val" stackId="f" radius={[4, 4, 4, 4]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={STAGE_COLORS[i] ?? STAGE_COLORS[0]} />
          ))}
          <LabelList
            dataKey="val"
            position="right"
            style={{ fill: labelColor, fontSize: 11, fontWeight: 600 }}
            formatter={(v: unknown) => formatVal(v as number)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
