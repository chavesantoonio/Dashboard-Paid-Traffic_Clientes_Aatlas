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
import { deleteUserAction } from "../actions";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function DeleteUserButton({ userId, userName, userEmail }: DeleteUserButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteUserAction(userId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Utilizador "${userName}" eliminado.`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Eliminar utilizador"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar utilizador</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar utilizador?</DialogTitle>
          <DialogDescription>
            Tens a certeza que queres eliminar <strong>{userName}</strong> (
            {userEmail})? Esta ação é irreversível e remove o acesso imediatamente.
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
