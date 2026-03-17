import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  highlight?: boolean;
  change?: number;
}

export function KpiCard({
  title,
  value,
  icon,
  description,
  highlight,
  change,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border p-5 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-2 hover:shadow-[0_25px_20px_-15px_rgba(249,115,22,0.5)] hover:border-orange-200 active:-translate-y-2 active:shadow-[0_25px_20px_-15px_rgba(249,115,22,0.5)] active:border-orange-200",
        highlight
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card shadow-sm"
      )}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
          {title}
        </p>
        <div className="shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-orange-400 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>
      </div>

      {/* Metric value */}
      <p
        className={cn(
          "mt-3 font-bold text-card-foreground tabular-nums tracking-tight",
          highlight ? "text-4xl" : "text-3xl"
        )}
      >
        {value}
      </p>

      {/* Bottom row: description + change badge */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {description && (
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        )}

        {change !== undefined && (
          <span
            className={cn(
              "ml-auto flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              change >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
