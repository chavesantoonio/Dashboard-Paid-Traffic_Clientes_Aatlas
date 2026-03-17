import type { Metadata } from "next";
import { ShieldOff } from "lucide-react";

export const metadata: Metadata = { title: "Conta Suspensa" };

export default function ContaSuspensaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldOff className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Conta Suspensa</h1>
          <p className="text-muted-foreground">
            O acesso desta organização ao dashboard foi temporariamente suspenso.
            Entre em contacto com a sua agência para mais informações.
          </p>
        </div>
      </div>
    </div>
  );
}
