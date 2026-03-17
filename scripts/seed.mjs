/**
 * seed.mjs — Injeta dados de demonstração no Supabase
 *
 * Execução: node scripts/seed.mjs
 *
 * O que faz:
 *  1. Garante que as organizações-demo existem
 *  2. Garante que a organização do superadmin existe
 *  3. Insere 45 dias de daily_metrics (meta, google_ads, gmb, ga4)
 *     para cada organização usando upsert (idempotente — pode rodar várias vezes)
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://bybbvlogssktaxderrpt.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_jsZYyocfXdRSsCp2FRMTGA_cmBluYmn";

// UUID da organização do superadmin (definido no create-superadmin.mjs)
const SUPERADMIN_ORG_ID = "0ad242cd-68c3-4a0b-826b-9d5119179fee";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Organizações de demonstração ──────────────────────────────────────────────

const ORGS = [
  { id: SUPERADMIN_ORG_ID, name: "Aatlas Company Digital" },
  { id: "11111111-aaaa-4bbb-8ccc-dddddddddddd", name: "Barbearia Lins" },
  { id: "22222222-aaaa-4bbb-8ccc-dddddddddddd", name: "APRO Orquídeas" },
  { id: "33333333-aaaa-4bbb-8ccc-dddddddddddd", name: "CWB Emporium" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna uma data ISO (YYYY-MM-DD) com offset de dias em relação a hoje */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Inteiro aleatório entre min e max (inclusivo) */
function rInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Decimal aleatório com 2 casas entre min e max */
function rDec(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Gera uma linha de daily_metrics para uma plataforma específica.
 * Os valores têm uma tendência levemente crescente no tempo (day 0 = mais recente).
 */
function makeRow(orgId, platform, dayOffset) {
  const date = daysAgo(dayOffset);

  // Fator de escala: dias mais recentes têm números ligeiramente maiores
  const trend = 1 + (44 - dayOffset) * 0.008; // +0.8% por dia mais recente

  switch (platform) {
    case "meta":
      return {
        organization_id: orgId,
        platform: "meta",
        date,
        spend:            rDec(80,  600)  * trend,
        impressions:      rInt(8000,  90000) * trend | 0,
        reach:            rInt(5000,  60000) * trend | 0,
        link_clicks:      rInt(120,   3000) * trend | 0,
        outbound_clicks:  rInt(80,    2000) * trend | 0,
        post_engagements: rInt(200,   5000) * trend | 0,
        video_views:      rInt(500,  20000) * trend | 0,
        messages_started: rInt(10,     200) * trend | 0,
        leads:            rInt(2,       50) * trend | 0,
      };

    case "google_ads":
      return {
        organization_id: orgId,
        platform: "google_ads",
        date,
        spend:       rDec(50,  400)  * trend,
        impressions: rInt(4000, 60000) * trend | 0,
        clicks:      rInt(100,  2500) * trend | 0,
        interactions:rInt(100,  2500) * trend | 0,
        conversions: rInt(5,     120) * trend | 0,
        leads:       rInt(3,      80) * trend | 0,
        calls:       rInt(2,      60) * trend | 0,
      };

    case "gmb":
      return {
        organization_id: orgId,
        platform: "gmb",
        date,
        profile_views:    rInt(80,   800) * trend | 0,
        search_queries:   rInt(150, 2000) * trend | 0,
        website_clicks:   rInt(20,   300) * trend | 0,
        calls:            rInt(10,   150) * trend | 0,
        directions_clicks:rInt(15,   250) * trend | 0,
        messages_started: rInt(5,     80) * trend | 0,
      };

    case "ga4":
      return {
        organization_id: orgId,
        platform: "ga4",
        date,
        sessions:          rInt(300,  5000) * trend | 0,
        engaged_sessions:  rInt(150,  2500) * trend | 0,
        pageviews:         rInt(800, 15000) * trend | 0,
        clicks:            rInt(100,  3000) * trend | 0,
        custom_events:     rInt(50,   1000) * trend | 0,
      };

    default:
      return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Iniciando seed de dados de demonstração…\n");

  // 1. Garante que as organizações existem
  console.log("📦 Verificando organizações…");
  for (const org of ORGS) {
    const { error } = await admin
      .from("organizations")
      .upsert({ id: org.id, name: org.name }, { onConflict: "id" });

    if (error) {
      console.error(`  ✗ Erro em "${org.name}":`, error.message);
    } else {
      console.log(`  ✓ ${org.name}`);
    }
  }

  // 2. Gera e insere daily_metrics
  const PLATFORMS = ["meta", "google_ads", "gmb", "ga4"];
  const DAYS = 45; // últimos 45 dias

  let total = 0;
  let errors = 0;

  console.log(`\n📊 Inserindo ${DAYS} dias × ${ORGS.length} orgs × ${PLATFORMS.length} plataformas…`);

  for (const org of ORGS) {
    process.stdout.write(`  ${org.name} … `);

    const rows = [];
    for (const platform of PLATFORMS) {
      for (let day = 0; day < DAYS; day++) {
        const row = makeRow(org.id, platform, day);
        if (row) rows.push(row);
      }
    }

    // Upsert em lotes de 100 (limite seguro do Supabase)
    const BATCH = 100;
    let orgErrors = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const { error } = await admin
        .from("daily_metrics")
        .upsert(batch, { onConflict: "organization_id,platform,date" });

      if (error) {
        orgErrors++;
        errors++;
        if (orgErrors === 1) console.error("\n    ✗", error.message);
      } else {
        total += batch.length;
      }
    }

    if (orgErrors === 0) {
      console.log(`✓ ${rows.length} linhas`);
    }
  }

  // 3. Resumo
  console.log("\n" + "─".repeat(50));
  console.log(`✅ Seed concluído!`);
  console.log(`   Linhas inseridas/atualizadas : ${total}`);
  if (errors > 0) console.log(`   Erros                        : ${errors} batches`);
  console.log(`\n💡 Para ver os dados:`);
  console.log(`   • Meta Ads      → /relatorios/meta-ads`);
  console.log(`   • Gestão Clientes → /gestao-clientes (superadmin)`);
}

seed().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
