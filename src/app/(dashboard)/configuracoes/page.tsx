import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageShell } from "@/components/layout/page-shell";
import { ConfigTabs } from "./_components/config-tabs";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  // ── Mesmo padrão que o layout (funciona com certainty) ────────────────────
  const { data: profile } = await admin
    .from("users")
    .select("name, avatar_url, role, organizations(id, name, status)")
    .eq("id", user.id)
    .single();

  const orgRaw = profile?.organizations;
  const orgBase =
    Array.isArray(orgRaw)
      ? (orgRaw[0] ?? null)
      : (orgRaw as { id: string; name: string; status: string | null } | null | undefined) ?? null;

  // ── Busca logo_url separadamente (coluna opcional — não quebra se não existir) ──
  let logoUrl: string | null = null;
  if (orgBase?.id) {
    const { data: orgExtra } = await admin
      .from("organizations")
      .select("logo_url")
      .eq("id", orgBase.id)
      .single();
    logoUrl = (orgExtra as { logo_url?: string | null } | null)?.logo_url ?? null;
  }

  // ── Busca platform_accounts ───────────────────────────────────────────────
  const { data: accounts } = orgBase?.id
    ? await admin
        .from("platform_accounts")
        .select("id, platform, account_name, is_active")
        .eq("organization_id", orgBase.id)
        .order("platform", { ascending: true })
    : { data: [] };

  return (
    <PageShell
      title="Configurações"
      breadcrumbs={[{ label: "Sistema" }, { label: "Configurações" }]}
    >
      <ConfigTabs
        user={{
          id: user.id,
          email: user.email ?? "",
          name: (profile as { name?: string | null } | null)?.name ?? null,
          avatar_url: (profile as { avatar_url?: string | null } | null)?.avatar_url ?? null,
        }}
        org={
          orgBase
            ? { id: orgBase.id, name: orgBase.name, status: orgBase.status, logo_url: logoUrl }
            : null
        }
        platformAccounts={accounts ?? []}
      />
    </PageShell>
  );
}
