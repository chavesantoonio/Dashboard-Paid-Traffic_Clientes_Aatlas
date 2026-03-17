"use client";

import * as React from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toggleOrganizationStatusAction } from "../actions";

interface ToggleStatusButtonProps {
  orgId: string;
  orgName: string;
  currentStatus: "active" | "suspended";
}

export function ToggleStatusButton({
  orgId,
  orgName,
  currentStatus,
}: ToggleStatusButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const isSuspending = currentStatus === "active";

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleOrganizationStatusAction(orgId, currentStatus);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      isSuspending
        ? `"${orgName}" suspensa com sucesso.`
        : `"${orgName}" reativada com sucesso.`
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            isSuspending
              ? "h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              : "h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          }
          aria-label={isSuspending ? "Suspender organização" : "Reativar organização"}
        >
          {isSuspending ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isSuspending ? "Suspender organização?" : "Reativar organização?"}
          </DialogTitle>
          <DialogDescription>
            {isSuspending ? (
              <>
                Suspender <strong>{orgName}</strong> vai bloquear o acesso de
                todos os seus utilizadores ao dashboard imediatamente.
              </>
            ) : (
              <>
                Reativar <strong>{orgName}</strong> vai restaurar o acesso de
                todos os seus utilizadores ao dashboard.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant={isSuspending ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={loading}
          >
            {loading
              ? isSuspending
                ? "A suspender..."
                : "A reativar..."
              : isSuspending
              ? "Suspender"
              : "Reativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
