import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { subDays, format } from "date-fns";
import {
  Users,
  UserCheck,
  Percent,
  BookOpen,
  MessageCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { DateRangePicker } from "@/components/date-range-picker";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ga4QualityChart } from "@/components/charts/Ga4QualityChart";
import { Ga4RetentionFunnel } from "@/components/charts/Ga4RetentionFunnel";

export const metadata: Metadata = { title: "Google Analytics 4" };

// ─── Formatadores ─────────────────────────────────────────────────────────────

function fNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function fPercent(value: number): string {
  return value.toFixed(2) + "%";
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

export default async function GoogleAnalyticsPage({ searchParams }: PageProps) {
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
    .select("id, date, sessions, engaged_sessions, pageviews, custom_events")
    .eq("platform", "ga4")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  const metrics = rows ?? [];

  // ── Totais (proteção contra divisão por zero nas derivadas) ───────────────
  const totals = metrics.reduce(
    (acc, row) => ({
      sessions:        acc.sessions        + (row.sessions         ?? 0),
      engagedSessions: acc.engagedSessions + (row.engaged_sessions ?? 0),
      pageviews:       acc.pageviews       + (row.pageviews        ?? 0),
      customEvents:    acc.customEvents    + (row.custom_events    ?? 0),
    }),
    { sessions: 0, engagedSessions: 0, pageviews: 0, customEvents: 0 }
  );

  // Métricas derivadas
  const engagementRate     = totals.sessions > 0
    ? (totals.engagedSessions / totals.sessions) * 100
    : 0;
  const pageviewsPerSession = totals.sessions > 0
    ? totals.pageviews / totals.sessions
    : 0;

  const periodLabel = `${metrics.length} dia${metrics.length !== 1 ? "s" : ""} · ${dateFrom} → ${dateTo}`;

  // ── Dados para gráficos (ordem cronológica) ────────────────────────────────
  const qualityData = [...metrics].reverse().map((row) => ({
    date:             row.date,
    sessions:         row.sessions         ?? 0,
    engaged_sessions: row.engaged_sessions ?? 0,
  }));

  const funnelData = [
    { stage: "Sessões Totais",    value: totals.sessions        },
    { stage: "Sessões Engajadas", value: totals.engagedSessions },
    { stage: "Cliques WhatsApp",  value: totals.customEvents    },
  ];

  return (
    <PageShell
      title="Google Analytics 4"
      iconImg="/icons/platforms/ga4.webp"
      breadcrumbs={[{ label: "Relatórios" }, { label: "Google Analytics 4" }]}
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
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Sem dados neste período</h3>
            <p className="text-sm text-muted-foreground">
              Nenhum dado de Google Analytics 4 encontrado entre {dateFrom} e {dateTo}.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">{periodLabel}</p>

          {/* ══ Banda 1: AUDITORIA DE TRÁFEGO E RETENÇÃO ════════════════════════ */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Auditoria de Tráfego e Retenção
            </h2>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <KpiCard
                title="Acessos Totais"
                value={fNumber(totals.sessions)}
                icon={<Users className="h-4 w-4" />}
                description="Total de sessões no período"
              />
              <KpiCard
                title="Tráfego Qualificado"
                value={fNumber(totals.engagedSessions)}
                icon={<UserCheck className="h-4 w-4" />}
                description="Sessões com interação ativa"
                highlight
              />
              <KpiCard
                title="Taxa de Engajamento"
                value={fPercent(engagementRate)}
                icon={<Percent className="h-4 w-4" />}
                description="Sessões engajadas ÷ sessões totais"
                highlight
              />
              <KpiCard
                title="Visualizações de Página"
                value={fNumber(totals.pageviews)}
                icon={<BookOpen className="h-4 w-4" />}
                description={`${pageviewsPerSession.toFixed(1)} páginas por sessão`}
              />
            </div>

            {/* Ga4QualityChart — panorâmico full-width */}
            <Card className="w-full bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  Sessões Totais vs. Sessões Engajadas ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <Ga4QualityChart data={qualityData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ══ Banda 2: O FUNIL DE AÇÃO ═════════════════════════════════════════ */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              O Funil de Ação
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Card de destaque: Cliques no WhatsApp */}
              <KpiCard
                title="Cliques no WhatsApp"
                value={fNumber(totals.customEvents)}
                icon={<MessageCircle className="h-4 w-4" />}
                description="Eventos-chave rastreados no site"
                highlight
              />

              {/* Funil — 3/4 da largura */}
              <Card className="xl:col-span-3 bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-card-foreground">
                    Funil de Retenção e Conversão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <Ga4RetentionFunnel data={funnelData} />
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
