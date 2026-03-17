"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
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
import { deleteOrganizationAction } from "../actions";

interface DeleteOrganizationButtonProps {
  orgId: string;
  orgName: string;
}

export function DeleteOrganizationButton({ orgId, orgName }: DeleteOrganizationButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteOrganizationAction(orgId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`"${orgName}" eliminada.`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Eliminar organização"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar organização?</DialogTitle>
          <DialogDescription>
            Tens a certeza que queres eliminar <strong>{orgName}</strong>? Esta
            ação é irreversível e apaga todos os dados associados.
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
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "A eliminar..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
