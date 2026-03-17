import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Meu Perfil" };

export default function PerfilPage() {
  return (
    <PageShell
      title="Meu Perfil"
      breadcrumbs={[{ label: "Sistema" }, { label: "Meu Perfil" }]}
    />
  );
}
