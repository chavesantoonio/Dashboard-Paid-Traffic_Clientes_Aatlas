import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Customer Success Global" };

export default function CustomerSuccessPage() {
  return (
    <PageShell
      title="Customer Success Global"
      breadcrumbs={[{ label: "Sucesso do Cliente" }, { label: "Customer Success Global" }]}
    />
  );
}
