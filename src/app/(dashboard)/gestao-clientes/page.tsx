import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageShell } from "@/components/layout/page-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewOrganizationDialog } from "./_components/new-organization-dialog";
import { CopyIdButton } from "./_components/copy-id-button";
import { DeleteOrganizationButton } from "./_components/delete-organization-button";
import { PlatformVisibilityDialog } from "./_components/platform-visibility-dialog";
import { ToggleStatusButton } from "./_components/toggle-status-button";

export const metadata: Metadata = { title: "Gestão de Clientes" };

const PLATFORM_LABELS: Record<string, string> = {
  meta: "Meta",
  google_ads: "Google Ads",
  gmb: "GMB",
  ga4: "GA4",
};

export default async function GestaoClientesPage() {
  // ── Auth + role guard ────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") redirect("/visao-global");

  // ── Data fetch ───────────────────────────────────────────────────────────
  const { data: organizations } = await admin
    .from("organizations")
    .select("id, name, created_at, enabled_platforms, status")
    .order("created_at", { ascending: false });

  const orgs = organizations ?? [];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <PageShell
      title="Gestão de Clientes"
      breadcrumbs={[{ label: "Agência" }, { label: "Gestão de Clientes" }]}
    >
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {orgs.length} organização{orgs.length !== 1 ? "s" : ""} registada
            {orgs.length !== 1 ? "s" : ""}
          </p>
          <NewOrganizationDialog />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Criada em</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plataformas</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {orgs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-zinc-500"
                  >
                    Nenhuma organização encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                orgs.map((org) => {
                  const enabledPlatforms: string[] =
                    (org.enabled_platforms as string[] | null) ??
                    ["meta", "google_ads", "gmb", "ga4"];

                  return (
                    <TableRow key={org.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <TableCell className="py-3.5 text-sm font-medium text-foreground">{org.name}</TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                            {org.id}
                          </span>
                          <CopyIdButton id={org.id} />
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-sm text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {enabledPlatforms.map((p) => (
                            <span
                              key={p}
                              className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-primary/10 text-primary"
                            >
                              {PLATFORM_LABELS[p] ?? p}
                            </span>
                          ))}
                          {enabledPlatforms.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Nenhuma
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {org.status === "suspended" ? (
                          <span className="inline-flex items-center rounded-full border border-red-500/20 px-2.5 py-0.5 text-[11px] font-semibold bg-red-500/10 text-red-400">
                            Suspensa
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">
                            Ativa
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <ToggleStatusButton
                            orgId={org.id}
                            orgName={org.name}
                            currentStatus={(org.status as "active" | "suspended") ?? "active"}
                          />
                          <PlatformVisibilityDialog
                            org={{
                              id: org.id,
                              name: org.name,
                              enabled_platforms: enabledPlatforms,
                            }}
                          />
                          <DeleteOrganizationButton
                            orgId={org.id}
                            orgName={org.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageShell>
  );
}
