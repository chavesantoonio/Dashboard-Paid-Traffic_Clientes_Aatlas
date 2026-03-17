import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bybbvlogssktaxderrpt.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_jsZYyocfXdRSsCp2FRMTGA_cmBluYmn";
const ORGANIZATION_ID = "0ad242cd-68c3-4a0b-826b-9d5119179fee";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createSuperAdmin() {
  // Lista todos os usuários para encontrar pelo email
  const { data: existing, error: listError } = await admin.auth.admin.listUsers();

  if (listError) {
    console.error("Erro ao listar usuários:", listError.message);
    process.exit(1);
  }

  const found = existing?.users?.find(
    (u) => u.email === "aatlascompanymkt@gmail.com"
  );

  if (found) {
    console.log("Usuário existente encontrado, ID:", found.id);
    console.log("Atualizando senha...");

    const { error: updateError } = await admin.auth.admin.updateUserById(
      found.id,
      {
        password: "Aatlas@100",
        email_confirm: true,
        user_metadata: {
          organization_id: ORGANIZATION_ID,
          role: "superadmin",
          name: "Aatlas",
        },
      }
    );

    if (updateError) {
      console.error("Erro ao atualizar:", updateError.message);
      process.exit(1);
    }

    // Garante que public.users tem a row correta
    await admin.from("users").upsert({
      id: found.id,
      organization_id: ORGANIZATION_ID,
      role: "superadmin",
      name: "Aatlas",
    });

    console.log("✓ Superadmin atualizado!");
    console.log("  Email: aatlascompanymkt@gmail.com");
    console.log("  Senha: Aatlas@100");
    return;
  }

  // Cria novo usuário via Admin API
  const { data, error } = await admin.auth.admin.createUser({
    email: "aatlascompanymkt@gmail.com",
    password: "Aatlas@100",
    email_confirm: true,
    user_metadata: {
      organization_id: ORGANIZATION_ID,
      role: "superadmin",
      name: "Aatlas",
    },
  });

  if (error) {
    console.error("Erro ao criar:", error.message);
    process.exit(1);
  }

  // Garante que public.users tem a row correta
  await admin.from("users").upsert({
    id: data.user.id,
    organization_id: ORGANIZATION_ID,
    role: "superadmin",
    name: "Aatlas",
  });

  console.log("✓ Superadmin criado!");
  console.log("  Email: aatlascompanymkt@gmail.com");
  console.log("  Senha: Aatlas@100");
}

createSuperAdmin();
