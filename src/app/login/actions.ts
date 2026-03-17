"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { error: string } | { success: true };

// ─── Login por email + senha ─────────────────────────────────────────────────

export async function loginAction(credentials: {
  email: string;
  password: string;
}): Promise<Result> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return { error: "Email ou senha incorrectos." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Confirma o teu email antes de entrar." };
    }
    if (error.message.includes("Too many requests")) {
      return { error: "Demasiadas tentativas. Aguarda alguns minutos." };
    }
    return { error: "Erro ao entrar. Tenta novamente." };
  }

  return { success: true };
}

// ─── Criar conta cliente ─────────────────────────────────────────────────────

export async function createPasswordAction(data: {
  organization: string;
  email: string;
  password: string;
}): Promise<Result> {
  const admin = createAdminClient();

  // 1. Verifica se a organização existe
  const { data: org } = await admin
    .from("organizations")
    .select("id, name")
    .ilike("name", data.organization)
    .single();

  if (!org) {
    return { error: "Organização não encontrada. Contacta o administrador." };
  }

  // 2. Verifica se já existe um utilizador para esta org
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("organization_id", org.id)
    .single();

  if (existing) {
    return {
      error: "Esta organização já tem uma conta. Usa 'Entrar' para fazer login.",
    };
  }

  // 3. Cria o utilizador — o trigger handle_new_auth_user insere em public.users
  //    automaticamente a partir do user_metadata
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        organization_id: org.id,
        role: "clientadmin",
        name: org.name,
      },
    });

  if (createError || !created.user) {
    if (createError?.message.includes("already registered")) {
      return { error: "Este email já está registado." };
    }
    return { error: "Erro ao criar conta. Tenta novamente." };
  }

  // 5. Faz login automático
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  return { success: true };
}

// ─── Recuperar senha por email ───────────────────────────────────────────────

export async function forgotPasswordAction(data: {
  email: string;
}): Promise<Result> {
  const supabase = await createClient();

  // Sempre retorna sucesso para não revelar se o email existe
  await supabase.auth.resetPasswordForEmail(data.email);

  return { success: true };
}
