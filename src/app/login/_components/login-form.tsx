"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  loginAction,
  createPasswordAction,
  forgotPasswordAction,
} from "../actions";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório.").email("Email inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

const createSchema = z
  .object({
    organization: z.string().min(1, "Nome da organização é obrigatório."),
    email: z.string().min(1, "Email é obrigatório.").email("Email inválido."),
    password: z.string().min(8, "Mínimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma a senha."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

const forgotSchema = z.object({
  email: z.string().min(1, "Email é obrigatório.").email("Email inválido."),
});

type LoginValues = z.infer<typeof loginSchema>;
type CreateValues = z.infer<typeof createSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;
type Mode = "login" | "create" | "forgot";

// ─── Componente ──────────────────────────────────────────────────────────────

export function LoginForm({ variant = "mobile" }: { variant?: "mobile" | "desktop" }) {
  const isDesktop = variant === "desktop";
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("login");
  const [forgotSent, setForgotSent] = React.useState(false);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const createForm = useForm<CreateValues>({ resolver: zodResolver(createSchema) });
  const forgotForm = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const handleLogin = async (data: LoginValues) => {
    const result = await loginAction(data);
    if ("error" in result) { toast.error(result.error); return; }
    router.push("/visao-global");
    router.refresh();
  };

  const handleCreate = async (data: CreateValues) => {
    const result = await createPasswordAction(data);
    if ("error" in result) { toast.error(result.error); return; }
    toast.success("Conta criada com sucesso!");
    router.push("/visao-global");
    router.refresh();
  };

  const handleForgot = async (data: ForgotValues) => {
    await forgotPasswordAction(data);
    setForgotSent(true);
  };

  // ── Modo: recuperar senha ──────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => { setMode("login"); setForgotSent(false); }}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </button>

        {forgotSent ? (
          <div className="rounded-lg bg-muted px-4 py-5 text-center space-y-2">
            <Mail className="mx-auto h-8 w-8 text-primary" />
            <p className="text-sm font-medium">Email enviado!</p>
            <p className="text-xs text-muted-foreground">
              Se o email existir no sistema, enviámos um link de recuperação.
              Verifica a tua caixa de entrada.
            </p>
          </div>
        ) : (
          <form
            onSubmit={forgotForm.handleSubmit(handleForgot)}
            className="space-y-4"
            noValidate
          >
            <p className="text-sm text-muted-foreground">
              Insere o teu email e enviaremos um link para redefinires a senha.
            </p>

            <div className="space-y-2">
              <label htmlFor="email-forgot" className="block text-[11px] font-medium uppercase tracking-wide text-zinc-400">Email</label>
              <input
                id="email-forgot"
                type="email"
                placeholder="placeholder@gmail.com"
                autoComplete="email"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/30 transition-colors"
                {...forgotForm.register("email")}
              />
              {forgotForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {forgotForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={forgotForm.formState.isSubmitting}
              className="mt-2 w-full rounded-[10px] bg-[#FF6200] py-[14px] text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {forgotForm.formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> A enviar…
                </span>
              ) : (
                "Enviar link de recuperação"
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── Modos: login / criar conta ────────────────────────────────────────────
  // ── Estilos condicionais por variant ─────────────────────────────────────
  const titleCls    = isDesktop ? "mb-2 text-[38px] font-bold tracking-tight text-white" : "mb-7 text-[28px] font-light tracking-tight text-white";
  const labelCls    = isDesktop ? "block text-[12px] font-medium text-zinc-400 mb-1" : "block text-[11px] font-medium uppercase tracking-wide text-zinc-400";
  const inputCls    = isDesktop ? "w-full h-12 rounded-[8px] border border-white/10 bg-white/5 px-4 text-[14px] text-white placeholder:text-zinc-500 outline-none focus:border-[#FF6200] transition-colors" : "w-full border-b border-white/15 bg-transparent py-2.5 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-white/40 transition-colors";
  const btnCls      = isDesktop ? "mt-2 w-full rounded-[8px] bg-[#FF6200] h-[52px] text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50" : "mt-2 w-full rounded-[10px] bg-[#FF6200] py-[14px] text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";
  const footerCls   = isDesktop ? "pt-5 text-center text-[13px] text-zinc-500" : "pt-5 text-center text-[13px] text-zinc-500";
  const footerLinkCls = isDesktop ? "font-semibold text-white underline underline-offset-2 hover:opacity-70 transition-opacity" : "font-semibold text-white underline underline-offset-2 hover:opacity-70 transition-opacity";
  const forgotCls   = isDesktop ? "text-xs text-zinc-500 hover:text-zinc-300 transition-colors" : "text-xs text-zinc-500 hover:text-zinc-300 transition-colors";

  return (
    <div>
      {/* Ícone asterisco — só desktop */}
      {isDesktop && (
        <div className="mb-3 text-[34px] leading-none text-[#FF6200]">✦</div>
      )}

      <h1 className={titleCls}>
        {mode === "create" ? "Cadastre-se" : "Entrar"}
      </h1>

      {/* Subtítulo + divisor — só desktop */}
      {isDesktop && (
        <>
          <p className="mt-2 text-[14px] text-zinc-400">
            {mode === "create" ? "Crie sua conta para começar." : "Acesse sua conta para continuar."}
          </p>
          <hr className="my-6 border-white/10" />
        </>
      )}

      {/* ── Login ── */}
      {mode === "login" && (
        <form
          onSubmit={loginForm.handleSubmit(handleLogin)}
          className="space-y-5"
          noValidate
        >
          <div className="space-y-1">
            <label htmlFor="email-login" className={labelCls}>Email</label>
            <input
              id="email-login"
              type="email"
              placeholder="placeholder@gmail.com"
              autoComplete="email"
              autoFocus
              className={inputCls}
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="pass-login" className={labelCls}>Senha</label>
            <input
              id="pass-login"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputCls}
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setMode("forgot")} className={forgotCls}>
              Esqueci minha senha
            </button>
          </div>

          <button type="submit" disabled={loginForm.formState.isSubmitting} className={btnCls}>
            {loginForm.formState.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> A entrar…
              </span>
            ) : "Entrar"}
          </button>

          <p className={footerCls}>
            Não tem uma conta?{" "}
            <button type="button" onClick={() => setMode("create")} className={footerLinkCls}>
              Cadastrar-se
            </button>
          </p>
        </form>
      )}

      {/* ── Criar conta ── */}
      {mode === "create" && (
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor="org-create" className={labelCls}>Organização</label>
            <input id="org-create" type="text" placeholder="Nome da empresa" autoComplete="organization" autoFocus className={inputCls} {...createForm.register("organization")} />
            {createForm.formState.errors.organization && <p className="text-xs text-red-400">{createForm.formState.errors.organization.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="email-create" className={labelCls}>Email</label>
            <input id="email-create" type="email" placeholder="placeholder@gmail.com" autoComplete="email" className={inputCls} {...createForm.register("email")} />
            {createForm.formState.errors.email && <p className="text-xs text-red-400">{createForm.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="pass-create" className={labelCls}>Senha</label>
            <input id="pass-create" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" className={inputCls} {...createForm.register("password")} />
            {createForm.formState.errors.password && <p className="text-xs text-red-400">{createForm.formState.errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm-create" className={labelCls}>Confirmar senha</label>
            <input id="confirm-create" type="password" placeholder="••••••••" autoComplete="new-password" className={inputCls} {...createForm.register("confirmPassword")} />
            {createForm.formState.errors.confirmPassword && <p className="text-xs text-red-400">{createForm.formState.errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={createForm.formState.isSubmitting} className={btnCls}>
            {createForm.formState.isSubmitting ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> A criar conta…</span>
            ) : "Cadastrar-se"}
          </button>

          <p className={footerCls}>
            Já tem uma conta?{" "}
            <button type="button" onClick={() => setMode("login")} className={footerLinkCls}>Entrar</button>
          </p>
        </form>
      )}
    </div>
  );
}
