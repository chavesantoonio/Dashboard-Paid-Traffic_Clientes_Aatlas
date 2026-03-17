"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Eye, EyeOff } from "lucide-react";

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
import { createUserAction } from "../actions";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  organizationId: z.string().uuid("Seleciona uma organização"),
  role: z.enum(["clientadmin", "clientviewer"]),
});

type FormValues = z.infer<typeof schema>;

interface Organization {
  id: string;
  name: string;
}

interface CreateUserDialogProps {
  organizations: Organization[];
}

export function CreateUserDialog({ organizations }: CreateUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "clientviewer" },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await createUserAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Utilizador criado com sucesso!");
    reset();
    setShowPassword(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Utilizador
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Utilizador</DialogTitle>
          <DialogDescription>
            Cria uma conta de acesso ao dashboard para um utilizador de cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="user-name">Nome completo</Label>
            <Input
              id="user-name"
              placeholder="ex: João Silva"
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="joao@empresa.com"
              autoComplete="off"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="user-password">Senha</Label>
            <div className="relative">
              <Input
                id="user-password"
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

          {/* Organização */}
          <div className="space-y-2">
            <Label htmlFor="user-org">Organização</Label>
            <select
              id="user-org"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue=""
              {...register("organizationId")}
            >
              <option value="" disabled>
                Seleciona uma organização...
              </option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <p className="text-xs text-destructive">
                {errors.organizationId.message}
              </p>
            )}
          </div>

          {/* Perfil */}
          <div className="space-y-2">
            <Label htmlFor="user-role">Perfil</Label>
            <select
              id="user-role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("role")}
            >
              <option value="clientviewer">Viewer (só leitura)</option>
              <option value="clientadmin">Admin (gestão do cliente)</option>
            </select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
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
              {isSubmitting ? "A criar..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
