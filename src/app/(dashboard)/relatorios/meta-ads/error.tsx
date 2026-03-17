"use client";

// O Next.js App Router exige que error.tsx seja um Client Component,
// pois recebe as props `error` e `reset` em runtime no browser.

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MetaAdsError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Ponto de extensão: enviar o erro a um serviço de monitorização
    // (ex: Sentry, LogRocket) quando for implementado.
    console.error("[MetaAds] Erro ao carregar dados:", error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold">Erro ao carregar Meta Ads</h3>
        <p className="text-sm text-muted-foreground">
          Não foi possível obter os dados. Verifica a tua ligação e tenta
          novamente.
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
