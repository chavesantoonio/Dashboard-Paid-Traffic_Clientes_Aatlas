import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { subDays, format } from "date-fns";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  BarChart2,
  Percent,
  Crosshair,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { DateRangePicker } from "@/components/date-range-picker";
import { GoogleAdsTrendChart } from "@/components/charts/GoogleAdsTrendChart";
import { GoogleAdsFunnelChart } from "@/components/charts/GoogleAdsFunnelChart";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Google Ads" };

// ─── Formatadores ─────────────────────────────────────────────────────────────

function fCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function fPercent(value: number): string {
  return value.toFixed(2) + "%";
}

function fNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h2>
  );
}

// ─── Helpers de data ──────────────────────────────────────────────────────────

function isValidDateParam(value: string | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function GoogleAdsPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── Resolução das datas ────────────────────────────────────────────────────
  const params = await searchParams;

  const today = new Date();
  const dateFrom = isValidDateParam(params.from)
    ? params.from
    : format(subDays(today, 14), "yyyy-MM-dd");

  const dateTo = isValidDateParam(params.to)
    ? params.to
    : format(today, "yyyy-MM-dd");

  // ── Query com RLS + filtro de datas ───────────────────────────────────────
  const { data: rows, error } = await supabase
    .from("daily_metrics")
    .select("id, date, spend, impressions, clicks, conversions")
    .eq("platform", "google_ads")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);

  const metrics = rows ?? [];

  // ── Totais via reduce ─────────────────────────────────────────────────────
  const totals = metrics.reduce(
    (acc, row) => ({
      spend:       acc.spend       + (row.spend       ?? 0),
      impressions: acc.impressions + (row.impressions ?? 0),
      clicks:      acc.clicks      + (row.clicks      ?? 0),
      conversions: acc.conversions + (row.conversions ?? 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  // ── Métricas derivadas (proteção contra divisão por zero) ─────────────────
  const cpa            = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const conversionRate = totals.clicks      > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const cpc            = totals.clicks      > 0 ? totals.spend / totals.clicks : 0;
  const ctr            = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  const periodLabel = `${metrics.length} dia${metrics.length !== 1 ? "s" : ""} · ${dateFrom} → ${dateTo}`;

  // ── Dados para o gráfico de tendência (já ordenados cronologicamente) ───────
  const chartData = metrics.map((row) => ({
    date: row.date,
    spend:       row.spend       ?? 0,
    conversions: row.conversions ?? 0,
  }));

  // ── Dados para o funil (derivados dos totais já calculados) ──────────────
  const funnelData = [
    { stage: "Impressões",  value: totals.impressions },
    { stage: "Cliques",     value: totals.clicks      },
    { stage: "Conversões",  value: totals.conversions },
  ];

  return (
    <PageShell
      title="Google Ads"
      iconImg="/icons/platforms/google-ads.webp"
      breadcrumbs={[{ label: "Relatórios" }, { label: "Google Ads" }]}
      actions={
        <Suspense fallback={null}>
          <DateRangePicker />
        </Suspense>
      }
    >
      {metrics.length === 0 ? (
        // ── Empty State ────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/40 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MousePointerClick className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Sem dados neste período
            </h3>
            <p className="text-sm text-muted-foreground">
              Nenhum dado de Google Ads encontrado entre {dateFrom} e {dateTo}.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-xs text-muted-foreground font-medium tracking-wide">
            {periodLabel}
          </p>

          {/* ── Secção 1: O Bolso ──────────────────────────────────────────── */}
          <div>
            <SectionLabel>O Bolso</SectionLabel>

            {/* Banda superior — 4 cards em largura total */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <KpiCard
                title="Investimento Total"
                value={fCurrency(totals.spend)}
                icon={<DollarSign className="h-5 w-5" />}
                description="Total investido no período"
              />
              <KpiCard
                title="Conversões"
                value={fNumber(totals.conversions)}
                icon={<Crosshair className="h-5 w-5" />}
                description="Ações concluídas rastreadas"
              />
              <KpiCard
                title="Custo por Conversão"
                value={fCurrency(cpa)}
                icon={<BarChart2 className="h-5 w-5" />}
                description="Investimento ÷ conversões"
              />
              <KpiCard
                title="Taxa de Conversão"
                value={fPercent(conversionRate)}
                icon={<TrendingUp className="h-5 w-5" />}
                description="Conversões ÷ cliques"
              />
            </div>

            {/* Banda inferior — gráfico panorâmico em largura total */}
            <Card className="w-full bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Investimento vs. Conversões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <GoogleAdsTrendChart data={chartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Secção 2: Meio de Funil ────────────────────────────────────── */}
          <div>
            <SectionLabel>Meio de Funil</SectionLabel>

            {/* Banda superior — 4 cards em largura total */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <KpiCard
                title="Cliques"
                value={fNumber(totals.clicks)}
                icon={<MousePointerClick className="h-5 w-5" />}
                description="Total de cliques nos anúncios"
              />
              <KpiCard
                title="CPC"
                value={fCurrency(cpc)}
                icon={<BarChart2 className="h-5 w-5" />}
                description="Custo por clique"
              />
              <KpiCard
                title="CTR"
                value={fPercent(ctr)}
                icon={<Percent className="h-5 w-5" />}
                description="Cliques ÷ impressões"
              />
              <KpiCard
                title="Impressões"
                value={fNumber(totals.impressions)}
                icon={<Eye className="h-5 w-5" />}
                description="Total de vezes exibido"
              />
            </div>

            {/* Banda inferior — funil panorâmico em largura total */}
            <Card className="w-full bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Funil de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <GoogleAdsFunnelChart data={funnelData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
