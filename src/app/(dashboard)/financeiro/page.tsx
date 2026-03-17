import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Financeiro" };

export default function FinanceiroPage() {
  return (
    <PageShell
      title="Financeiro"
      breadcrumbs={[{ label: "Gestão" }, { label: "Financeiro" }]}
    />
  );
}
