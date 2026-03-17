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

export interface GoogleAdsDayData {
  date: string;
  spend: number;
  conversions: number;
}

interface GoogleAdsTrendChartProps {
  data: GoogleAdsDayData[];
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
          <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-card-foreground">
            {p.name === "Investimento"
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(p.value)
              : new Intl.NumberFormat("pt-BR").format(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GoogleAdsTrendChart({ data }: GoogleAdsTrendChartProps) {
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
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gadsSpendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6200" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF6200" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gadsConvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

        <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />

        <YAxis
          yAxisId="left"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}K` : `R$${v}`}
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

        <Area yAxisId="left" type="monotone" dataKey="spend" name="Investimento" stroke="#FF6200" strokeWidth={2} fill="url(#gadsSpendGrad)" dot={false} activeDot={{ r: 4, fill: "#FF6200" }} />
        <Area yAxisId="right" type="monotone" dataKey="conversions" name="Conversões" stroke="#34d399" strokeWidth={2} fill="url(#gadsConvGrad)" dot={false} activeDot={{ r: 4, fill: "#34d399" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
