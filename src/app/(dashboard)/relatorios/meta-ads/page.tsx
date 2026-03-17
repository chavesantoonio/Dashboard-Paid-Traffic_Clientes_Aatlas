import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { subDays, format } from "date-fns";
import {
  MessageCircle,
  DollarSign,
  MousePointerClick,
  TrendingDown,
  Eye,
  BarChart2,
  Percent,
  Gauge,
  Target,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { DateRangePicker } from "@/components/date-range-picker";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaAdsTrendChart } from "@/components/charts/MetaAdsTrendChart";
import { MetaAdsFunnelChart } from "@/components/charts/MetaAdsFunnelChart";

export const metadata: Metadata = { title: "Meta Ads" };

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

// ─── Helpers de data ──────────────────────────────────────────────────────────

/** Valida que a string é YYYY-MM-DD e representa uma data real */
function isValidDateParam(value: string | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function MetaAdsPage({ searchParams }: PageProps) {
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
    : format(subDays(today, 14), "yyyy-MM-dd"); // fallback: últimos 15 dias

  const dateTo = isValidDateParam(params.to)
    ? params.to
    : format(today, "yyyy-MM-dd");

  // ── Query com RLS + filtro de datas ───────────────────────────────────────
  const { data: rows, error } = await supabase
    .from("daily_metrics")
    .select("id, date, spend, impressions, link_clicks, messages_started")
    .eq("platform", "meta")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  const metrics = rows ?? [];

  // ── Totais via reduce ─────────────────────────────────────────────────────
  const totals = metrics.reduce(
    (acc, row) => ({
      spend:           acc.spend           + (row.spend            ?? 0),
      impressions:     acc.impressions     + (row.impressions      ?? 0),
      linkClicks:      acc.linkClicks      + (row.link_clicks      ?? 0),
      messagesStarted: acc.messagesStarted + (row.messages_started ?? 0),
    }),
    { spend: 0, impressions: 0, linkClicks: 0, messagesStarted: 0 }
  );

  // ── Métricas derivadas (proteção contra divisão por zero) ─────────────────
  const cpa     = totals.messagesStarted > 0 ? totals.spend / totals.messagesStarted : 0;
  const dropOff = totals.linkClicks      > 0 ? ((totals.linkClicks - totals.messagesStarted) / totals.linkClicks) * 100 : 0;
  const cpc     = totals.linkClicks      > 0 ? totals.spend / totals.linkClicks : 0;
  const ctr     = totals.impressions     > 0 ? (totals.linkClicks / totals.impressions) * 100 : 0;

  const periodLabel = `${metrics.length} dia${metrics.length !== 1 ? "s" : ""} · ${dateFrom} → ${dateTo}`;

  // ── Dados para o TrendChart (ordem cronológica — query veio descending) ────
  const chartData = [...metrics]
    .reverse()
    .map((row) => ({
      date:             row.date,
      spend:            row.spend            ?? 0,
      messages_started: row.messages_started ?? 0,
    }));

  // ── Dados para o FunnelChart ──────────────────────────────────────────────
  const funnelData = [
    { stage: "Impressões",          value: totals.impressions     },
    { stage: "Cliques no Link",     value: totals.linkClicks      },
    { stage: "Mensagens (WhatsApp)", value: totals.messagesStarted },
  ];

  return (
    <PageShell
      title="Meta Ads"
      iconImg="/icons/platforms/meta-ads.webp"
      breadcrumbs={[{ label: "Relatórios" }, { label: "Meta Ads" }]}
      actions={
        <Suspense fallback={null}>
          <DateRangePicker />
        </Suspense>
      }
    >
      {metrics.length === 0 ? (
        // ── Empty State ────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Target className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Sem dados neste período</h3>
            <p className="text-sm text-muted-foreground">
              Nenhum dado de Meta Ads encontrado entre {dateFrom} e {dateTo}.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">{periodLabel}</p>

          {/* ── Secção 1: O Bolso ──────────────────────────────────────────── */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              O Bolso
            </h2>

            {/* Banda superior — 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <KpiCard
                title="Investimento Total"
                value={fCurrency(totals.spend)}
                icon={<DollarSign className="h-4 w-4" />}
                description="Total investido no período"
              />
              <KpiCard
                title="Mensagens Iniciadas"
                value={fNumber(totals.messagesStarted)}
                icon={<MessageCircle className="h-4 w-4" />}
                description="Conversas abertas via anúncio"
              />
              <KpiCard
                title="Custo por Mensagem"
                value={fCurrency(cpa)}
                icon={<Gauge className="h-4 w-4" />}
                description="Investimento ÷ mensagens iniciadas"
              />
              <KpiCard
                title="Taxa de Quebra"
                value={fPercent(dropOff)}
                icon={<TrendingDown className="h-4 w-4" />}
                description="Cliques que não viraram conversa"
              />
            </div>

            {/* Banda inferior — TrendChart panorâmico */}
            <Card className="w-full bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Investimento vs. Mensagens ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <MetaAdsTrendChart data={chartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Secção 2: Meio de Funil ────────────────────────────────────── */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Meio de Funil
            </h2>

            {/* Banda superior — 4 cards de tráfego e atenção */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <KpiCard
                title="Cliques no Link"
                value={fNumber(totals.linkClicks)}
                icon={<MousePointerClick className="h-4 w-4" />}
                description="Total de cliques no anúncio"
              />
              <KpiCard
                title="CPC"
                value={fCurrency(cpc)}
                icon={<BarChart2 className="h-4 w-4" />}
                description="Custo por clique"
              />
              <KpiCard
                title="CTR"
                value={fPercent(ctr)}
                icon={<Percent className="h-4 w-4" />}
                description="Cliques ÷ impressões"
              />
              <KpiCard
                title="Impressões"
                value={fNumber(totals.impressions)}
                icon={<Eye className="h-4 w-4" />}
                description="Total de vezes exibido"
              />
            </div>

            {/* Banda inferior — FunnelChart panorâmico */}
            <Card className="w-full bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Funil de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <MetaAdsFunnelChart data={funnelData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
