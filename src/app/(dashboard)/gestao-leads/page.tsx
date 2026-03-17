import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Gestão de Leads Globais" };

export default function GestaoLeadsPage() {
  return (
    <PageShell
      title="Gestão de Leads Globais"
      breadcrumbs={[{ label: "Comercial" }, { label: "Gestão de Leads Globais" }]}
    />
  );
}
