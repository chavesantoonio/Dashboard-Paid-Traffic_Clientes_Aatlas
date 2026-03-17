import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Metas" };

export default function MetasPage() {
  return (
    <PageShell
      title="Metas"
      breadcrumbs={[{ label: "Gestão" }, { label: "Metas" }]}
    />
  );
}
