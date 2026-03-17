import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { subDays, format } from "date-fns";
import {
  Phone,
  Navigation,
  ExternalLink,
  Eye,
  Search,
  MapPin,
  Star,
  MousePointerClick,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { DateRangePicker } from "@/components/date-range-picker";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GmbTrendChart } from "@/components/charts/GmbTrendChart";
import { GmbActionsChart } from "@/components/charts/GmbActionsChart";

export const metadata: Metadata = { title: "Google Meu Negócio" };

// ─── Formatadores ─────────────────────────────────────────────────────────────

function fNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
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

export default async function GoogleMeuNegocioPage({ searchParams }: PageProps) {
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

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data: rows, error } = await supabase
    .from("daily_metrics")
    .select("id, date, profile_views, search_queries, website_clicks, calls, directions_clicks")
    .eq("platform", "gmb")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  const metrics = rows ?? [];

  // ── Totais ────────────────────────────────────────────────────────────────
  const totals = metrics.reduce(
    (acc, row) => ({
      profileViews:     acc.profileViews     + (row.profile_views     ?? 0),
      searchQueries:    acc.searchQueries    + (row.search_queries    ?? 0),
      websiteClicks:    acc.websiteClicks    + (row.website_clicks    ?? 0),
      calls:            acc.calls            + (row.calls             ?? 0),
      directionsClicks: acc.directionsClicks + (row.directions_clicks ?? 0),
    }),
    { profileViews: 0, searchQueries: 0, websiteClicks: 0, calls: 0, directionsClicks: 0 }
  );

  const discoveries  = totals.profileViews + totals.searchQueries;
  const interactions = totals.calls + totals.directionsClicks + totals.websiteClicks;

  const periodLabel = `${metrics.length} dia${metrics.length !== 1 ? "s" : ""} · ${dateFrom} → ${dateTo}`;

  // ── Dados para gráficos (ordem cronológica) ────────────────────────────────
  const chartData = [...metrics].reverse().map((row) => ({
    date:         row.date,
    discoveries:  (row.profile_views ?? 0) + (row.search_queries ?? 0),
    interactions: (row.calls ?? 0) + (row.directions_clicks ?? 0) + (row.website_clicks ?? 0),
  }));

  const actionsData = [
    { name: "Ligações",        value: totals.calls            },
    { name: "Rotas",           value: totals.directionsClicks },
    { name: "Cliques no Site", value: totals.websiteClicks    },
  ].filter((d) => d.value > 0);

  return (
    <PageShell
      title="Google Meu Negócio"
      iconImg="/icons/platforms/gmb.webp"
      breadcrumbs={[{ label: "Relatórios" }, { label: "Google Meu Negócio" }]}
      actions={
        <Suspense fallback={null}>
          <DateRangePicker />
        </Suspense>
      }
    >
      {metrics.length === 0 ? (
        // ── Empty State ──────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Sem dados neste período</h3>
            <p className="text-sm text-muted-foreground">
              Nenhum dado de Google Meu Negócio encontrado entre {dateFrom} e {dateTo}.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">{periodLabel}</p>

          {/* ══ Secção 1: VISIBILIDADE E RETENÇÃO ORGÂNICA ═══════════════════════ */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Visibilidade e Retenção Orgânica
            </h2>

            {/* Banda de 4 KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <KpiCard
                title="Visualizações Totais"
                value={fNumber(totals.profileViews)}
                icon={<Eye className="h-4 w-4" />}
                description="Visitas ao perfil no período"
              />
              <KpiCard
                title="Pesquisas (Diretas + Descobertas)"
                value={fNumber(totals.searchQueries)}
                icon={<Search className="h-4 w-4" />}
                description="Vezes que o perfil apareceu em buscas"
              />
              <KpiCard
                title="Total de Interações"
                value={fNumber(interactions)}
                icon={<MousePointerClick className="h-4 w-4" />}
                description="Ligações + Rotas + Cliques no site"
                highlight
              />
              <KpiCard
                title="Avaliação Média"
                value="—"
                icon={<Star className="h-4 w-4" />}
                description="Dado não disponível na integração atual"
              />
            </div>

            {/* TrendChart panorâmico full-width */}
            <Card className="w-full bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Descobertas vs. Interações ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <GmbTrendChart data={chartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ══ Secção 2: COMPORTAMENTO DO CLIENTE ═══════════════════════════════ */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Comportamento do Cliente
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* KPI cards de ação empilhados — 1/3 */}
              <div className="flex flex-col gap-4">
                <KpiCard
                  title="Ligações"
                  value={fNumber(totals.calls)}
                  icon={<Phone className="h-4 w-4" />}
                  description="Chamadas originadas do perfil"
                />
                <KpiCard
                  title="Rotas Solicitadas"
                  value={fNumber(totals.directionsClicks)}
                  icon={<Navigation className="h-4 w-4" />}
                  description="Pedidos de direção ao estabelecimento"
                />
                <KpiCard
                  title="Cliques para o Site"
                  value={fNumber(totals.websiteClicks)}
                  icon={<ExternalLink className="h-4 w-4" />}
                  description="Acessos ao site ou WhatsApp"
                />
              </div>

              {/* Donut de distribuição de ações — 2/3 */}
              <Card className="xl:col-span-2 bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-card-foreground">
                    Para onde vai a intenção do cliente?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    {actionsData.length > 0 ? (
                      <GmbActionsChart data={actionsData} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">Sem ações no período</p>
                      </div>
                    )}
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
