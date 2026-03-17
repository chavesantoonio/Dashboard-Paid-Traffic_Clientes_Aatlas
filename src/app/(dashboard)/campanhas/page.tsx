import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Campanhas" };

export default function CampanhasPage() {
  return (
    <PageShell
      title="Campanhas"
      breadcrumbs={[{ label: "Comercial" }, { label: "Campanhas" }]}
    />
  );
}
