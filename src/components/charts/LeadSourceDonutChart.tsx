"use client";

import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from "recharts";

export interface LeadSourceData {
  name: string;
  value: number;
}

interface LeadSourceDonutChartProps {
  data: LeadSourceData[];
}

const COLORS = ["#60a5fa", "#34d399"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-card-foreground">{name}</p>
      <p className="mt-0.5 font-bold text-card-foreground">
        {new Intl.NumberFormat("pt-BR").format(value)} leads
      </p>
    </div>
  );
}

function CustomLegend({
  payload,
}: {
  payload?: { value: string; color: string }[];
}) {
  if (!payload?.length) return null;
  return (
    <div className="flex justify-center gap-5 pt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function LeadSourceDonutChart({ data }: LeadSourceDonutChartProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const centerColor = isLight ? "#18181b" : "#ffffff";

  const total = data.reduce((s, d) => s + d.value, 0);
  const totalFormatted = new Intl.NumberFormat("pt-BR").format(total);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
          <Label
            content={({ viewBox }) => {
              const { cx, cy } = viewBox as { cx: number; cy: number };
              return (
                <g>
                  <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" fill={centerColor} style={{ fontSize: 22, fontWeight: 700 }}>
                    {totalFormatted}
                  </text>
                  <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="middle" fill="#71717a" style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 2 }}>
                    total
                  </text>
                </g>
              );
            }}
          />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
