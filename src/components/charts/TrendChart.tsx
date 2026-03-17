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

export interface TrendDataPoint {
  date: string;
  spend: number;
  leads: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
}

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
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-card-foreground">
            {p.name === "Gasto (R$)"
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(p.value)
              : new Intl.NumberFormat("pt-BR").format(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ data }: TrendChartProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const axisColor = isLight ? "#52525b" : "#71717a";
  const gridColor = isLight ? "#e4e4e7" : "#27272a";
  const legendColor = isLight ? "#52525b" : "#71717a";

  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(8) + "/" + d.date.slice(5, 7),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendSpendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6200" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF6200" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="trendLeadsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

        <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />

        <YAxis
          yAxisId="left"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}K` : `R$${v}`}
          width={52}
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

        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: legendColor, paddingTop: 8 }} />

        <Area yAxisId="left" type="monotone" dataKey="spend" name="Gasto (R$)" stroke="#FF6200" strokeWidth={2} fill="url(#trendSpendGrad)" dot={false} activeDot={{ r: 4, fill: "#FF6200" }} />
        <Area yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" strokeWidth={2} fill="url(#trendLeadsGrad)" dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
