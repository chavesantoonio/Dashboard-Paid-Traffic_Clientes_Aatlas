"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateUserPasswordAction } from "../actions";

const schema = z
  .object({
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

interface EditPasswordDialogProps {
  userId: string;
  userName: string;
}

export function EditPasswordDialog({ userId, userName }: EditPasswordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const result = await updateUserPasswordAction(userId, values.password);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Senha de ${userName} atualizada.`);
    reset();
    setShowPassword(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Alterar senha"
        >
          <KeyRound className="h-4 w-4" />
          <span className="sr-only">Alterar senha</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>
            Define uma nova senha para <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nova senha */}
          <div className="space-y-2">
            <Label htmlFor={`pw-${userId}`}>Nova senha</Label>
            <div className="relative">
              <Input
                id={`pw-${userId}`}
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-2">
            <Label htmlFor={`pw-confirm-${userId}`}>Confirmar senha</Label>
            <Input
              id={`pw-confirm-${userId}`}
              type={showPassword ? "text" : "password"}
              placeholder="Repete a nova senha"
              autoComplete="new-password"
              {...register("confirm")}
            />
            {errors.confirm && (
              <p className="text-xs text-destructive">{errors.confirm.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
