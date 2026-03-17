import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TenantProvider, type WorkspaceInfo } from "@/components/layout/tenant-context";
import { UserAvatarProvider } from "@/components/layout/user-avatar-context";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar, type UserProfile } from "@/components/layout/top-bar";
import { MainContent } from "@/components/layout/main-content";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Busca perfil + organização via admin (bypass RLS)
  const { data: profile } = user
    ? await admin
        .from("users")
        .select("name, avatar_url, role, organizations(id, name, enabled_platforms, status)")
        .eq("id", user.id)
        .single()
    : { data: null };

  // ── Perfil do utilizador (TopBar) ──────────────────────────────────────────
  const userName = profile?.name ?? user?.email?.split("@")[0] ?? "Utilizador";
  const userEmail = user?.email ?? "";
  const userRole = (profile?.role as string) ?? "";
  const userAvatarUrl = (profile as { avatar_url?: string | null } | null)?.avatar_url ?? null;

  const userProfile: UserProfile = {
    name: userName,
    email: userEmail,
    role: userRole,
    initials: getInitials(userName),
  };

  // ── Workspace (TenantSwitcher / Sidebar) ───────────────────────────────────
  const orgRaw = profile?.organizations;
  const org: { id: string; name: string; enabled_platforms?: string[] | null; status?: string | null } | null =
    Array.isArray(orgRaw)
      ? (orgRaw[0] ?? null)
      : ((orgRaw as { id: string; name: string; enabled_platforms?: string[] | null; status?: string | null } | null | undefined) ?? null);

  const isSuperAdmin = userRole === "superadmin";

  // ── Bloqueio de org suspensa ────────────────────────────────────────────────
  if (org?.status === "suspended" && !isSuperAdmin) {
    redirect("/bloqueado");
  }

  const workspace: WorkspaceInfo = {
    orgId: org?.id ?? "aatlas",
    name: org?.name ?? "Aatlas Company",
    subtitle: isSuperAdmin ? "Agência" : "Cliente",
    initials: getInitials(org?.name ?? "Aatlas Company"),
    color: isSuperAdmin ? "bg-primary" : "bg-emerald-600",
  };

  const enabledPlatforms: string[] =
    org?.enabled_platforms ?? ["meta", "google_ads", "gmb", "ga4"];

  return (
    <TenantProvider workspace={workspace} userRole={userRole} enabledPlatforms={enabledPlatforms}>
      <UserAvatarProvider initialUrl={userAvatarUrl}>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />

          <div className="flex flex-1 flex-col overflow-y-auto">
            <TopBar user={userProfile} />

            <MainContent>{children}</MainContent>
          </div>
        </div>
      </SidebarProvider>
      </UserAvatarProvider>
    </TenantProvider>
  );
}
