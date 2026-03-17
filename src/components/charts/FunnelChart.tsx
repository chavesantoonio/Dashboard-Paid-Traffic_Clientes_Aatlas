"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";

export interface FunnelStage {
  stage: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: FunnelStage; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const { stage, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-card-foreground">{stage}</p>
      <p className="mt-0.5 font-bold text-card-foreground">
        {new Intl.NumberFormat("pt-BR").format(value)}
      </p>
    </div>
  );
}

const OPACITIES = [1, 0.75, 0.55, 0.35];

export function FunnelChart({ data }: FunnelChartProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const axisColor = isLight ? "#52525b" : "#9ca3af";
  const labelColor = isLight ? "#52525b" : "#9ca3af";
  const cursorFill = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
      >
        <XAxis
          type="number"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
            : v >= 1000 ? `${(v / 1000).toFixed(0)}K`
            : String(v)
          }
        />
        <YAxis
          type="category"
          dataKey="stage"
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />

        <Bar dataKey="value" name="Volume" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={`rgba(255, 98, 0, ${OPACITIES[i] ?? 0.2})`} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            style={{ fill: labelColor, fontSize: 11, fontWeight: 600 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => typeof v === "number" ? new Intl.NumberFormat("pt-BR").format(v) : String(v ?? "")}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
