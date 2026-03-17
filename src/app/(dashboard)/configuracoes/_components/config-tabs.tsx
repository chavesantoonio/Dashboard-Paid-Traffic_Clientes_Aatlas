"use client";

import { useRef, useState, useTransition } from "react";
import {
  User,
  Building2,
  Plug,
  Mail,
  CheckCircle2,
  AlertCircle,
  Camera,
  Pencil,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Check,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  updateOrgNameAction,
  uploadOrgLogoAction,
  updateOwnPasswordAction,
  updateUserNameAction,
  uploadUserAvatarAction,
} from "../actions";
import { useUserAvatar } from "@/components/layout/user-avatar-context";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigTabsProps {
  user: { id: string; email: string; name: string | null; avatar_url: string | null };
  org: {
    id: string;
    name: string;
    status: string | null;
    logo_url: string | null;
  } | null;
  platformAccounts: {
    id: string;
    platform: string;
    account_name: string | null;
    is_active: boolean;
  }[];
}

// ─── Mapa de plataformas ──────────────────────────────────────────────────────

const PLATFORM_META: Record<string, { label: string; iconImg?: string }> = {
  meta:       { label: "Meta Ads",           iconImg: "/icons/platforms/meta-ads.webp"    },
  google_ads: { label: "Google Ads",         iconImg: "/icons/platforms/google-ads.webp"  },
  ga4:        { label: "Google Analytics 4", iconImg: "/icons/platforms/ga4.webp"         },
  gmb:        { label: "Google Meu Negócio", iconImg: "/icons/platforms/gmb.webp"         },
};

// ─── Sub-componentes internos ─────────────────────────────────────────────────

/** Mensagem de feedback inline */
function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <p
      className={`flex items-center gap-1.5 text-xs font-medium ${
        type === "success"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {type === "success" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" />
      )}
      {message}
    </p>
  );
}

/** Upload + preview do logo */
function OrgLogoUpload({
  orgId,
  currentUrl,
}: {
  orgId: string;
  currentUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local imediato
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    const fd = new FormData();
    fd.append("logo", file);

    setFeedback(null);
    startTransition(async () => {
      const result = await uploadOrgLogoAction(orgId, fd);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        setPreview(currentUrl); // reverte preview
      } else {
        setFeedback({ type: "success", message: "Logo atualizado com sucesso." });
        if (result.url) setPreview(result.url);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar com botão de câmera */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="group relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Alterar logo da empresa"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo" className="h-full w-full object-cover" />
        ) : (
          <Building2 className="m-auto h-10 w-10 text-muted-foreground" />
        )}
        {/* Overlay ao hover */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </span>
        {/* Spinner */}
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />

      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ou SVG · máx. 5 MB</p>

      {feedback && <Feedback type={feedback.type} message={feedback.message} />}
    </div>
  );
}

/** Formulário de edição do nome da empresa */
function OrgNameForm({ orgId, initialName }: { orgId: string; initialName: string }) {
  const [value, setValue] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrgNameAction(orgId, value);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Nome atualizado com sucesso." });
        setIsEditing(false);
      }
    });
  }

  function handleCancel() {
    setValue(initialName);
    setIsEditing(false);
    setFeedback(null);
  }

  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Nome da Empresa
      </Label>

      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || value.trim() === initialName}
              className="h-8 text-xs"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  A guardar…
                </span>
              ) : (
                "Guardar"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="h-8 text-xs"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
          {feedback && <Feedback type={feedback.type} message={feedback.message} />}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{value}</p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded p-0.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Editar nome"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {feedback?.type === "success" && (
            <Feedback type="success" message={feedback.message} />
          )}
        </div>
      )}
    </div>
  );
}

/** Upload + preview do avatar do utilizador */
function UserAvatarUpload({ currentUrl }: { currentUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { setAvatarUrl } = useUserAvatar();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("avatar", file);

    setFeedback(null);
    startTransition(async () => {
      const result = await uploadUserAvatarAction(fd);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        setPreview(currentUrl);
      } else {
        setFeedback({ type: "success", message: "Foto atualizada com sucesso." });
        if (result.url) {
          setPreview(result.url);
          setAvatarUrl(result.url);
        }
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="group relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Alterar foto de perfil"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="m-auto h-10 w-10 text-muted-foreground" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </span>
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />

      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ou SVG · máx. 5 MB</p>
      {feedback && <Feedback type={feedback.type} message={feedback.message} />}
    </div>
  );
}

/** Formulário de edição do nome do utilizador */
function UserNameForm({ initialName }: { initialName: string }) {
  const [value, setValue] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateUserNameAction(value);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Nome atualizado com sucesso." });
        setIsEditing(false);
      }
    });
  }

  function handleCancel() {
    setValue(initialName);
    setIsEditing(false);
    setFeedback(null);
  }

  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Nome
      </Label>

      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || value.trim() === initialName}
              className="h-8 text-xs"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  A guardar…
                </span>
              ) : (
                "Guardar"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="h-8 text-xs"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
          {feedback && <Feedback type={feedback.type} message={feedback.message} />}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{value}</p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded p-0.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Editar nome"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {feedback?.type === "success" && (
            <Feedback type="success" message={feedback.message} />
          )}
        </div>
      )}
    </div>
  );
}

/** Formulário de alteração de senha */
function ChangePasswordForm({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (next !== confirm) {
      setFeedback({ type: "error", message: "As senhas não coincidem." });
      return;
    }
    if (next.length < 8) {
      setFeedback({ type: "error", message: "A nova senha deve ter pelo menos 8 caracteres." });
      return;
    }

    startTransition(async () => {
      const result = await updateOwnPasswordAction(current, next);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Senha alterada com sucesso." });
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Senha atual */}
      <div className="space-y-1.5">
        <Label htmlFor="current-password" className="text-sm">
          Senha atual
        </Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Digite a senha atual"
            disabled={isPending}
            required
            className="h-9 pr-9 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            tabIndex={-1}
            aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Nova senha */}
      <div className="space-y-1.5">
        <Label htmlFor="new-password" className="text-sm">
          Nova senha
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            disabled={isPending}
            required
            className="h-9 pr-9 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowNext((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            tabIndex={-1}
            aria-label={showNext ? "Ocultar senha" : "Mostrar senha"}
          >
            {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirmar nova senha */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password" className="text-sm">
          Confirmar nova senha
        </Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repita a nova senha"
          disabled={isPending}
          required
          className="h-9 text-sm"
        />
      </div>

      {feedback && <Feedback type={feedback.type} message={feedback.message} />}

      <Button type="submit" size="sm" disabled={isPending} className="h-8 text-xs">
        {isPending ? (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            A alterar…
          </span>
        ) : (
          "Alterar senha"
        )}
      </Button>

      {/* Campo oculto necessário para autocomplete funcionar corretamente */}
      <input type="hidden" name="username" value={email} autoComplete="username" readOnly />
    </form>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ConfigTabs({ user, org, platformAccounts }: ConfigTabsProps) {
  const isActive = org?.status !== "suspended";

  return (
    <Tabs defaultValue="perfil" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 bg-muted h-11">
        <TabsTrigger
          value="perfil"
          className="flex items-center gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <User className="h-4 w-4" />
          Meu Perfil
        </TabsTrigger>
        <TabsTrigger
          value="empresa"
          className="flex items-center gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Building2 className="h-4 w-4" />
          Minha Empresa
        </TabsTrigger>
        <TabsTrigger
          value="integracoes"
          className="flex items-center gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Plug className="h-4 w-4" />
          Integrações
        </TabsTrigger>
      </TabsList>

      {/* ── Aba 1: Meu Perfil ────────────────────────────────────────────────── */}
      <TabsContent value="perfil" className="space-y-4">
        {/* Foto e nome */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-card-foreground">Informações do Perfil</CardTitle>
            <CardDescription>Foto e nome visíveis na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <UserAvatarUpload currentUrl={user.avatar_url} />
              <div className="flex-1 w-full space-y-4">
                <UserNameForm initialName={user.name ?? ""} />
                <Separator />
                {/* E-mail (read-only) */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alterar senha */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Escolha uma senha forte com pelo menos 8 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm email={user.email} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Aba 2: Minha Empresa ─────────────────────────────────────────────── */}
      <TabsContent value="empresa" className="space-y-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-card-foreground">Perfil da Empresa</CardTitle>
            <CardDescription>
              Logo e nome visíveis no painel. Gerenciados por você.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {org ? (
              <div className="space-y-6">
                {/* Logo */}
                <div className="flex flex-col items-center gap-1 sm:items-start sm:flex-row sm:gap-6">
                  <OrgLogoUpload orgId={org.id} currentUrl={org.logo_url} />

                  <div className="flex-1 space-y-4 w-full">
                    {/* Nome editável */}
                    <OrgNameForm orgId={org.id} initialName={org.name} />

                    <Separator />

                    {/* Status (read-only) */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Status da Conta
                      </p>
                      <div>
                        {isActive ? (
                          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-semibold">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-[11px] font-semibold">
                            Suspenso
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma organização associada a este utilizador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Aba 3: Integrações ───────────────────────────────────────────────── */}
      <TabsContent value="integracoes" className="space-y-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-card-foreground">Integrações de Dados</CardTitle>
            <CardDescription>
              Plataformas de marketing conectadas e sincronizando com o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {platformAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Plug className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Nenhuma integração ativa</p>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                    As integrações são configuradas pela equipa da Aatlas.
                    Fale com o seu gestor de conta.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {platformAccounts.map((account) => {
                  const meta = PLATFORM_META[account.platform];
                  const label = meta?.label ?? account.platform;
                  const initials = label.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

                  return (
                    <li key={account.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {meta?.iconImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={meta.iconImg}
                            alt={label}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-foreground">{initials}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        {account.account_name && (
                          <p className="text-xs text-muted-foreground truncate">{account.account_name}</p>
                        )}
                      </div>

                      {account.is_active ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Conectado
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            Inativo
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          As integrações são gerenciadas pela Aatlas · Dados sincronizados automaticamente a cada 24h.
        </p>
      </TabsContent>
    </Tabs>
  );
}
