import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Visão Global" };

export default function VisaoGlobalPage() {
  return (
    <PageShell
      title="Visão Global"
      breadcrumbs={[{ label: "Agência" }, { label: "Visão Global" }]}
    />
  );
}
