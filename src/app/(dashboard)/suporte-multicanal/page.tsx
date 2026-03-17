import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Suporte Multicanal" };

export default function SuporteMulticanalPage() {
  return (
    <PageShell
      title="Suporte Multicanal"
      breadcrumbs={[{ label: "Sucesso do Cliente" }, { label: "Suporte Multicanal" }]}
    />
  );
}
