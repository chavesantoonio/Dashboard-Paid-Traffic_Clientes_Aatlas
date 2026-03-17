import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { subDays, format } from "date-fns";
import {
  DollarSign,
  MessageCircle,
  Gauge,
  MousePointerClick,
  MapPin,
  Globe,
  Eye,
  BookOpen,
  Activity,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { DateRangePicker } from "@/components/date-range-picker";
import { KpiCard } from "@/components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendChart, type TrendDataPoint } from "@/components/charts/TrendChart";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";
import { CpaDistributionChart, type CpaPlatformData } from "@/components/charts/CpaDistributionChart";
import { LeadSourceDonutChart, type LeadSourceData } from "@/components/charts/LeadSourceDonutChart";

export const metadata: Metadata = { title: "Dashboard Resumo" };

// ─── Formatadores ─────────────────────────────────────────────────────────────

function fCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function fNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function fPercent(value: number): string {
  return value.toFixed(1) + "%";
}

// ─── Helpers de data ──────────────────────────────────────────────────────────

function isValidDateParam(value: string | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MetricRow {
  date:              string;
  platform:          string;
  spend:             number | null;
  impressions:       number | null;
  link_clicks:       number | null;
  messages_started:  number | null;
  clicks:            number | null;
  conversions:       number | null;
  profile_views:     number | null;
  search_queries:    number | null;
  sessions:          number | null;
  pageviews:         number | null;
  engaged_sessions:  number | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function DashboardResumoPage({ searchParams }: PageProps) {
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

  // ── Query única — todas as plataformas, RLS filtra a org ──────────────────
  const { data: rows, error } = await supabase
    .from("daily_metrics")
    .select(
      "date, platform, spend, impressions, link_clicks, messages_started, clicks, conversions, profile_views, search_queries, sessions, pageviews, engaged_sessions"
    )
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);

  const metrics: MetricRow[] = rows ?? [];

  // ── Agregação global ───────────────────────────────────────────────────────
  const agg = metrics.reduce(
    (acc, row) => {
      const isPaid = row.platform === "meta" || row.platform === "google_ads";
      const isMeta = row.platform === "meta";
      const isGads = row.platform === "google_ads";
      const isGmb  = row.platform === "gmb";
      const isGa4  = row.platform === "ga4";

      return {
        totalSpend:        acc.totalSpend        + (isPaid ? (row.spend            ?? 0) : 0),
        totalLeads:        acc.totalLeads
          + (isMeta ? (row.messages_started ?? 0) : 0)
          + (isGads ? (row.conversions      ?? 0) : 0),
        totalPaidClicks:   acc.totalPaidClicks
          + (isMeta ? (row.link_clicks ?? 0) : 0)
          + (isGads ? (row.clicks      ?? 0) : 0),
        totalOrganic:      acc.totalOrganic      + (isGmb  ? (row.profile_views ?? 0) + (row.search_queries ?? 0) : 0),
        totalSessions:     acc.totalSessions     + (isGa4  ? (row.sessions          ?? 0) : 0),
        totalPageviews:    acc.totalPageviews    + (isGa4  ? (row.pageviews         ?? 0) : 0),
        totalEngaged:      acc.totalEngaged      + (isGa4  ? (row.engaged_sessions  ?? 0) : 0),
        totalImpressions:  acc.totalImpressions  + (isPaid ? (row.impressions       ?? 0) : 0),
        metaSpend:         acc.metaSpend         + (isMeta ? (row.spend             ?? 0) : 0),
        metaLeads:         acc.metaLeads         + (isMeta ? (row.messages_started  ?? 0) : 0),
        gadsSpend:         acc.gadsSpend         + (isGads ? (row.spend             ?? 0) : 0),
        gadsLeads:         acc.gadsLeads         + (isGads ? (row.conversions       ?? 0) : 0),
      };
    },
    {
      totalSpend: 0, totalLeads: 0, totalPaidClicks: 0, totalOrganic: 0,
      totalSessions: 0, totalPageviews: 0, totalEngaged: 0, totalImpressions: 0,
      metaSpend: 0, metaLeads: 0, gadsSpend: 0, gadsLeads: 0,
    }
  );

  // ── Flags de renderização condicional ─────────────────────────────────────
  const hasSiteData = agg.totalSessions > 0 || agg.totalPageviews > 0 || agg.totalEngaged > 0;

  // ── Métricas derivadas ────────────────────────────────────────────────────
  const blendedCpa     = agg.totalLeads       > 0 ? agg.totalSpend / agg.totalLeads       : 0;
  const blendedCpc     = agg.totalPaidClicks  > 0 ? agg.totalSpend / agg.totalPaidClicks  : 0;
  const engagementRate = agg.totalSessions    > 0 ? (agg.totalEngaged / agg.totalSessions) * 100 : 0;

  // ── Dados para os gráficos ────────────────────────────────────────────────

  // TrendChart — spend + leads por dia
  const trendMap = new Map<string, { spend: number; leads: number }>();
  for (const row of metrics) {
    const prev = trendMap.get(row.date) ?? { spend: 0, leads: 0 };
    const isPaid = row.platform === "meta" || row.platform === "google_ads";
    trendMap.set(row.date, {
      spend: prev.spend + (isPaid ? (row.spend ?? 0) : 0),
      leads: prev.leads
        + (row.platform === "meta"        ? (row.messages_started ?? 0) : 0)
        + (row.platform === "google_ads"  ? (row.conversions      ?? 0) : 0),
    });
  }
  const trendData: TrendDataPoint[] = Array.from(trendMap.entries())
    .map(([date, v]) => ({ date, ...v }));

  // FunnelChart — "Sessões" só entra se há dados de site
  const funnelData: FunnelStage[] = [
    { stage: "Impressões",  value: agg.totalImpressions },
    { stage: "Cliques",     value: agg.totalPaidClicks  },
    ...(hasSiteData ? [{ stage: "Sessões", value: agg.totalSessions }] : []),
    { stage: "Conversões",   value: agg.totalLeads       },
  ];

  // LeadSourceDonutChart
  const leadSourceData: LeadSourceData[] = [
    { name: "Meta Ads",   value: agg.metaLeads  },
    { name: "Google Ads", value: agg.gadsLeads  },
  ];

  // CpaDistributionChart
  const cpaDistData: CpaPlatformData[] = [
    {
      platform: "Meta Ads",
      leads: agg.metaLeads,
      cpa: agg.metaLeads > 0 ? agg.metaSpend / agg.metaLeads : 0,
    },
    {
      platform: "Google Ads",
      leads: agg.gadsLeads,
      cpa: agg.gadsLeads > 0 ? agg.gadsSpend / agg.gadsLeads : 0,
    },
  ];

  const hasAnyData  = metrics.length > 0;
  const periodLabel = `${dateFrom} → ${dateTo}`;

  return (
    <PageShell
      title="Dashboard Resumo"
      iconImg="/icons/platforms/powerbi.webp"
      breadcrumbs={[{ label: "Relatórios" }, { label: "Dashboard Resumo" }]}
      actions={
        <Suspense fallback={null}>
          <DateRangePicker />
        </Suspense>
      }
    >
      {!hasAnyData ? (
        // ── Empty State ────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Globe className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Sem dados neste período</h3>
            <p className="text-sm text-muted-foreground">
              Nenhuma campanha retornou dados entre {dateFrom} e {dateTo}.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">{periodLabel}</p>

          {/* ── Secção 1: A Máquina de Vendas (sempre visível) ─────────────── */}
          <div>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              A Máquina de Vendas
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <KpiCard
                title="Investimento Total"
                value={fCurrency(agg.totalSpend)}
                icon={<DollarSign className="h-4 w-4" />}
                description="Todas as campanhas ativas"
                highlight
              />
              <KpiCard
                title="Conversões Geradas"
                value={fNumber(agg.totalLeads)}
                icon={<MessageCircle className="h-4 w-4" />}
                description="Total de conversões no período"
                highlight
              />
              <KpiCard
                title="Custo por Conversão"
                value={blendedCpa > 0 ? fCurrency(blendedCpa) : "—"}
                icon={<Gauge className="h-4 w-4" />}
                description="Investimento ÷ conversões geradas"
                highlight
              />
            </div>
          </div>

          {/* ── Secção 2: Autoridade e Engajamento (cards de site condicionais) */}
          <div>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Autoridade e Engajamento
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Fixos — sempre renderizam */}
              <KpiCard
                title="Impressões da Marca"
                value={fNumber(agg.totalImpressions)}
                icon={<Eye className="h-4 w-4" />}
                description="Alcance total das campanhas"
              />
              <KpiCard
                title="Custo por Clique Médio"
                value={blendedCpc > 0 ? fCurrency(blendedCpc) : "—"}
                icon={<MousePointerClick className="h-4 w-4" />}
                description="Investimento ÷ cliques nas campanhas"
              />
              {/* Condicionais — só se há dados de site */}
              {hasSiteData && (
                <KpiCard
                  title="Páginas Vistas"
                  value={fNumber(agg.totalPageviews)}
                  icon={<BookOpen className="h-4 w-4" />}
                  description="Volume de navegação no site"
                />
              )}
              {hasSiteData && (
                <KpiCard
                  title="Taxa de Engajamento"
                  value={engagementRate > 0 ? fPercent(engagementRate) : "—"}
                  icon={<Activity className="h-4 w-4" />}
                  description="Sessões com interação ÷ sessões totais"
                />
              )}
            </div>
          </div>

          {/* ── Secção 4: Análise de Desempenho (gráficos) ────────────────── */}
          <div>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Análise de Desempenho
            </h2>

            {/* TrendChart — largura total */}
            <Card className="mb-5 bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Investimento vs Conversões ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={trendData} />
              </CardContent>
            </Card>

            {/* Funil + CPA + Donut */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-card-foreground">
                    Funil de Conversão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FunnelChart data={funnelData} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-card-foreground">
                    Distribuição de Conversões e CPA por Canal
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <div className="h-[260px]">
                    <CpaDistributionChart data={cpaDistData} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-card-foreground">
                    Origem das Conversões
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-[260px]">
                    <LeadSourceDonutChart data={leadSourceData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
