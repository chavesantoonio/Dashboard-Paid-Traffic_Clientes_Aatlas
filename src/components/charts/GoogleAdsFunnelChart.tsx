"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface FunnelStageData {
  stage: string;
  value: number;
}

interface GoogleAdsFunnelChartProps {
  data: FunnelStageData[];
}

function formatVal(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("pt-BR").format(v);
}

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

export function GoogleAdsFunnelChart({ data }: GoogleAdsFunnelChartProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const axisColor = isLight ? "#52525b" : "#9ca3af";
  const labelColor = isLight ? "#52525b" : "#9ca3af";
  const cursorFill = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartData = data.map((d) => ({
    stage: d.stage,
    val: d.value,
    pad: (maxVal - d.value) / 2,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
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
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />

        <Bar dataKey="pad" stackId="f" fill="transparent" legendType="none" />
        <Bar dataKey="val" stackId="f" fill="#FF6200" radius={[4, 4, 4, 4]}>
          <LabelList
            dataKey="val"
            position="right"
            style={{ fill: labelColor, fontSize: 11, fontWeight: 600 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => formatVal(typeof v === "number" ? v : 0)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
