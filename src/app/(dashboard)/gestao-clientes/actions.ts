"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
});

export async function createOrganizationAction(formData: FormData) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") return { error: "Sem permissão." };

  // Validate
  const parsed = createOrgSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await admin
    .from("organizations")
    .insert({ name: parsed.data.name });

  if (error) {
    if (error.code === "23505") return { error: "Já existe uma organização com esse nome." };
    return { error: "Erro ao criar organização. Tenta novamente." };
  }

  revalidatePath("/gestao-clientes");
  return { success: true };
}

const VALID_PLATFORMS = ["meta", "google_ads", "gmb", "ga4"] as const;
type PlatformType = (typeof VALID_PLATFORMS)[number];

export async function updatePlatformVisibilityAction(
  orgId: string,
  platforms: string[]
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") return { error: "Sem permissão." };

  if (
    !Array.isArray(platforms) ||
    platforms.some((p) => !VALID_PLATFORMS.includes(p as PlatformType))
  ) {
    return { error: "Plataformas inválidas." };
  }

  const { error } = await admin
    .from("organizations")
    .update({ enabled_platforms: platforms })
    .eq("id", orgId);

  if (error) return { error: "Erro ao atualizar plataformas. Tenta novamente." };

  revalidatePath("/gestao-clientes");
  return { success: true };
}

export async function toggleOrganizationStatusAction(
  orgId: string,
  currentStatus: "active" | "suspended"
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") return { error: "Sem permissão." };

  const newStatus = currentStatus === "active" ? "suspended" : "active";

  const { error } = await admin
    .from("organizations")
    .update({ status: newStatus })
    .eq("id", orgId);

  if (error) return { error: "Erro ao alterar status. Tenta novamente." };

  revalidatePath("/gestao-clientes");
  return { success: true };
}

export async function deleteOrganizationAction(orgId: string) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") return { error: "Sem permissão." };

  const { error } = await admin
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (error) return { error: "Erro ao eliminar organização. Tenta novamente." };

  revalidatePath("/gestao-clientes");
  return { success: true };
}
