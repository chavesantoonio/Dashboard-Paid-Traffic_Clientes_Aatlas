"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_ROLES = ["clientadmin", "clientviewer"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

const ALL_ROLES = ["superadmin", "clientadmin", "clientviewer"] as const;
type AnyRole = (typeof ALL_ROLES)[number];

async function checkSuperAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Não autenticado.";

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") return "Sem permissão.";
  return null;
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  organizationId: string;
  role: string;
}): Promise<{ success?: boolean; error?: string }> {
  const err = await checkSuperAdmin();
  if (err) return { error: err };

  if (!VALID_ROLES.includes(data.role as ValidRole)) {
    return { error: "Perfil inválido." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      organization_id: data.organizationId,
      role: data.role,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este email já está registado." };
    }
    return { error: `Erro ao criar utilizador: ${error.message}` };
  }

  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUserPasswordAction(
  userId: string,
  password: string
): Promise<{ success?: boolean; error?: string }> {
  const err = await checkSuperAdmin();
  if (err) return { error: err };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });

  if (error) return { error: "Erro ao atualizar senha. Tenta novamente." };
  return { success: true };
}

export async function updateUserRoleAction(
  userId: string,
  role: string
): Promise<{ success?: boolean; error?: string }> {
  const err = await checkSuperAdmin();
  if (err) return { error: err };

  if (!ALL_ROLES.includes(role as AnyRole)) {
    return { error: "Perfil inválido." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: "Erro ao atualizar perfil. Tenta novamente." };

  revalidatePath("/usuarios");
  return { success: true };
}

export async function deleteUserAction(
  userId: string
): Promise<{ success?: boolean; error?: string }> {
  const err = await checkSuperAdmin();
  if (err) return { error: err };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return { error: "Erro ao eliminar utilizador. Tenta novamente." };

  revalidatePath("/usuarios");
  return { success: true };
}
