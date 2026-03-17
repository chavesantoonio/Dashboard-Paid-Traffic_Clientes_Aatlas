import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Automação de Prospecção" };

export default function AutomacaoProspeccaoPage() {
  return (
    <PageShell
      title="Automação de Prospecção"
      breadcrumbs={[{ label: "Comercial" }, { label: "Automação de Prospecção" }]}
    />
  );
}
