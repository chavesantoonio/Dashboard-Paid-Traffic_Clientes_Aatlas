"use client";

import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface GmbActionSlice {
  name: string;
  value: number;
}

// ─── Cores por ação ───────────────────────────────────────────────────────────
const ACTION_COLORS = [
  "#34A853", // Ligações     — verde Google
  "#4285F4", // Rotas        — azul Google
  "#FBBC05", // Cliques site — amarelo Google
];

const fmt = (v: number) => new Intl.NumberFormat("pt-BR").format(v);

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { pct: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-card-foreground">{p.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        <span className="font-bold text-card-foreground">{fmt(p.value)}</span>
        {" · "}
        {p.payload.pct}
      </p>
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GmbActionsChart({ data }: { data: GmbActionSlice[] }) {
  const { resolvedTheme } = useTheme();
  const isLight  = resolvedTheme === "light";
  const legColor = isLight ? "#52525b" : "#71717a";
  const fgColor  = isLight ? "#09090b" : "#fafafa";
  const muteColor = isLight ? "#71717a" : "#9ca3af";

  const total = data.reduce((s, d) => s + d.value, 0);
  const totalLabel = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : fmt(total);

  const enriched = data.map((d) => ({
    ...d,
    pct: total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : "0%",
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          innerRadius="52%"
          outerRadius="72%"
          paddingAngle={3}
          dataKey="value"
          isAnimationActive={false}
        >
          {enriched.map((_, i) => (
            <Cell key={i} fill={ACTION_COLORS[i % ACTION_COLORS.length]} stroke="transparent" />
          ))}

          {/* Label central duplo: rótulo + total */}
          <Label
            content={({ viewBox }) => {
              const { cx = 0, cy = 0 } = (viewBox as { cx?: number; cy?: number }) ?? {};
              return (
                <g>
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 11, fill: muteColor }}
                  >
                    Total
                  </text>
                  <text
                    x={cx}
                    y={cy + 13}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 22, fontWeight: 700, fill: fgColor }}
                  >
                    {totalLabel}
                  </text>
                </g>
              );
            }}
          />
        </Pie>

        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: legColor, paddingTop: 4 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
