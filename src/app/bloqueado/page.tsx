import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "./actions";

export const metadata: Metadata = { title: "Acesso Suspenso" };

export default function BloqueadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center gap-4 pb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Acesso Temporariamente Suspenso</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O acesso da sua organização ao dashboard foi temporariamente suspenso.
            Por favor, entre em contacto com a{" "}
            <span className="font-semibold text-foreground">Aatlas Company</span>{" "}
            para regularizar a situação da sua conta.
          </p>
        </CardContent>

        <CardFooter className="justify-center pt-2">
          <form action={logoutAction}>
            <Button variant="outline" type="submit">
              Terminar sessão
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
