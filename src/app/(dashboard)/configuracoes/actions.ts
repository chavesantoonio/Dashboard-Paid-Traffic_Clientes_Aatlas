"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { success?: boolean; error?: string };

// ── Helper: garante que o orgId pertence ao utilizador logado ────────────────
async function resolveUserOrg(orgId: string): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profile?.organization_id !== orgId) return { error: "Sem permissão." };
  return { userId: user.id };
}

// ── Atualizar nome da organização ────────────────────────────────────────────
export async function updateOrgNameAction(orgId: string, name: string): Promise<Result> {
  const trimmed = name?.trim() ?? "";
  if (trimmed.length < 2) return { error: "Nome deve ter pelo menos 2 caracteres." };
  if (trimmed.length > 100) return { error: "Nome deve ter no máximo 100 caracteres." };

  const check = await resolveUserOrg(orgId);
  if ("error" in check) return check;

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizations")
    .update({ name: trimmed })
    .eq("id", orgId);

  if (error) return { error: "Erro ao atualizar nome. Tenta novamente." };

  revalidatePath("/configuracoes");
  return { success: true };
}

// ── Upload do logo da organização ─────────────────────────────────────────────
// Pré-requisito Supabase: bucket "org-logos" público + coluna logo_url na tabela organizations
// SQL: ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url text;
export async function uploadOrgLogoAction(
  orgId: string,
  formData: FormData
): Promise<Result & { url?: string }> {
  const check = await resolveUserOrg(orgId);
  if ("error" in check) return check;

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum ficheiro selecionado." };
  if (file.size > 5 * 1024 * 1024) return { error: "Ficheiro deve ter no máximo 5 MB." };

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!ALLOWED.includes(file.type)) {
    return { error: "Formato inválido. Use JPG, PNG, WEBP ou SVG." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${orgId}/logo.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("org-logos")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: "Erro ao enviar imagem. Verifique o bucket 'org-logos'." };

  const {
    data: { publicUrl },
  } = admin.storage.from("org-logos").getPublicUrl(path);

  // Cache-bust para forçar recarregamento da imagem
  const urlWithBust = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await admin
    .from("organizations")
    .update({ logo_url: urlWithBust })
    .eq("id", orgId);

  if (updateError) {
    return { error: "Imagem enviada mas erro ao guardar. Contacta o suporte." };
  }

  revalidatePath("/configuracoes");
  return { success: true, url: urlWithBust };
}

// ── Atualizar o próprio nome ─────────────────────────────────────────────────
export async function updateUserNameAction(name: string): Promise<Result> {
  const trimmed = name?.trim() ?? "";
  if (trimmed.length < 2) return { error: "Nome deve ter pelo menos 2 caracteres." };
  if (trimmed.length > 100) return { error: "Nome deve ter no máximo 100 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ name: trimmed })
    .eq("id", user.id);

  if (error) return { error: "Erro ao atualizar nome. Tenta novamente." };

  revalidatePath("/configuracoes");
  return { success: true };
}

// ── Upload do avatar do utilizador ───────────────────────────────────────────
// Pré-requisito Supabase: bucket "user-avatars" público + coluna avatar_url na tabela users
// SQL: ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
export async function uploadUserAvatarAction(
  formData: FormData
): Promise<Result & { url?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum ficheiro selecionado." };
  if (file.size > 5 * 1024 * 1024) return { error: "Ficheiro deve ter no máximo 5 MB." };

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!ALLOWED.includes(file.type)) {
    return { error: "Formato inválido. Use JPG, PNG, WEBP ou SVG." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("user-avatars")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: `Upload falhou: ${uploadError.message}` };

  const {
    data: { publicUrl },
  } = admin.storage.from("user-avatars").getPublicUrl(path);

  const urlWithBust = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await admin
    .from("users")
    .update({ avatar_url: urlWithBust })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Imagem enviada mas erro ao guardar. Contacta o suporte." };
  }

  revalidatePath("/configuracoes");
  return { success: true, url: urlWithBust };
}

// ── Atualizar a própria senha ────────────────────────────────────────────────
export async function updateOwnPasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<Result> {
  if (!newPassword || newPassword.length < 8) {
    return { error: "A nova senha deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Não autenticado." };

  // Valida a senha atual antes de alterar
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Senha atual incorreta." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Erro ao atualizar senha. Tenta novamente." };

  return { success: true };
}
