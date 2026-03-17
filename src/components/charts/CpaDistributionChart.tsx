"use client";

import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface CpaPlatformData {
  platform: string;
  leads: number;
  cpa: number;
}

interface CpaDistributionChartProps {
  data: CpaPlatformData[];
}

const COLORS = ["#FF6200", "#60a5fa"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CpaPlatformData }[];
}) {
  if (!active || !payload?.length) return null;
  const { platform, leads, cpa } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-bold text-card-foreground">{platform}</p>
      <div className="space-y-0.5">
        <p className="text-muted-foreground">
          Leads:{" "}
          <span className="font-semibold text-card-foreground">
            {new Intl.NumberFormat("pt-BR").format(leads)}
          </span>
        </p>
        <p className="text-muted-foreground">
          CPA:{" "}
          <span className="font-semibold text-card-foreground">
            {cpa > 0
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(cpa)
              : "—"}
          </span>
        </p>
      </div>
    </div>
  );
}

function RenderLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}) {
  if ((percent ?? 0) < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 0.5;
  const x = (cx ?? 0) + r * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = (cy ?? 0) + r * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700 }}>
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
}

export function CpaDistributionChart({ data }: CpaDistributionChartProps) {
  const { resolvedTheme } = useTheme();
  const legendColor = resolvedTheme === "light" ? "#52525b" : "#9ca3af";

  const pieData = data.map((d) => ({ ...d, value: d.leads }));
  const totalLeads = data.reduce((s, d) => s + d.leads, 0);

  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="46%"
            innerRadius={55}
            outerRadius={82}
            dataKey="value"
            labelLine={false}
            label={RenderLabel}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: legendColor, paddingTop: 4 }} />
        </PieChart>
      </ResponsiveContainer>

      <p className="text-center text-xs text-muted-foreground">
        Total de leads:{" "}
        <span className="font-bold text-card-foreground">
          {new Intl.NumberFormat("pt-BR").format(totalLeads)}
        </span>
      </p>
    </div>
  );
}
