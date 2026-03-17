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
import { CreateUserDialog } from "./_components/create-user-dialog";
import { EditPasswordDialog } from "./_components/edit-password-dialog";
import { DeleteUserButton } from "./_components/delete-user-button";
import { EditRoleSelect } from "./_components/edit-role-select";

export const metadata: Metadata = { title: "Utilizadores" };

export default async function UsuariosPage() {
  // ── Auth + role guard ────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const admin = createAdminClient();
  const { data: selfProfile } = await admin
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (selfProfile?.role !== "superadmin") redirect("/visao-global");

  // ── Fetch data ───────────────────────────────────────────────────────────

  // Perfis públicos com nome da org
  const { data: profiles } = await admin
    .from("users")
    .select("id, name, role, created_at, organizations(id, name)")
    .order("created_at", { ascending: false });

  // Emails via Auth Admin API
  const {
    data: { users: authUsers },
  } = await admin.auth.admin.listUsers({ perPage: 1000 });

  const emailMap = Object.fromEntries(
    authUsers.map((u) => [u.id, u.email ?? "—"])
  );

  const users = (profiles ?? []).map((p) => {
    const orgRaw = p.organizations;
    const orgName = Array.isArray(orgRaw)
      ? (orgRaw[0] as { name: string } | undefined)?.name ?? "—"
      : (orgRaw as { name: string } | null)?.name ?? "—";

    return {
      id: p.id,
      name: p.name,
      email: emailMap[p.id] ?? "—",
      role: p.role as string,
      orgName,
      createdAt: p.created_at,
    };
  });

  // Lista de organizações para o select de criação
  const { data: organizations } = await admin
    .from("organizations")
    .select("id, name")
    .order("name", { ascending: true });

  const orgs = (organizations ?? []) as { id: string; name: string }[];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <PageShell
      title="Utilizadores"
      breadcrumbs={[{ label: "Gestão" }, { label: "Utilizadores" }]}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {users.length} utilizador{users.length !== 1 ? "es" : ""} registado
            {users.length !== 1 ? "s" : ""}
          </p>
          <CreateUserDialog organizations={orgs} />
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[90px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Nenhum utilizador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === authUser.id;

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {u.orgName}
                      </TableCell>

                      <TableCell>
                        <EditRoleSelect
                          userId={u.id}
                          currentRole={u.role}
                          disabled={isSelf}
                        />
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <EditPasswordDialog
                            userId={u.id}
                            userName={u.name}
                          />
                          {!isSelf && (
                            <DeleteUserButton
                              userId={u.id}
                              userName={u.name}
                              userEmail={u.email}
                            />
                          )}
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
