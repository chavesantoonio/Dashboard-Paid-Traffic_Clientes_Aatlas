import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Pedidos" };

export default function PedidosPage() {
  return (
    <PageShell
      title="Pedidos"
      breadcrumbs={[{ label: "Comercial" }, { label: "Pedidos" }]}
    />
  );
}
