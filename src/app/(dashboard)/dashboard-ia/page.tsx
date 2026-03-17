import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Dashboard IA" };

export default function DashboardIAPage() {
  return (
    <PageShell
      title="Dashboard IA"
      breadcrumbs={[{ label: "Inteligência" }, { label: "Dashboard IA" }]}
    />
  );
}
