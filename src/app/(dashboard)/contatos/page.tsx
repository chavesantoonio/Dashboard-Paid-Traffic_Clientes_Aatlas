import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Contatos" };

export default function ContatosPage() {
  return (
    <PageShell
      title="Contatos"
      breadcrumbs={[{ label: "Comercial" }, { label: "Contatos" }]}
    />
  );
}
