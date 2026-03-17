"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/nav-config";
import { useTheme } from "next-themes";
import { useSidebar } from "./sidebar-context";
import { useTenant } from "./tenant-context";
import { ThemeToggle } from "./theme-toggle";
import { TenantSwitcher } from "./tenant-switcher";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Single nav item ────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  iconImg?: string;
  title: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function NavLink({
  href,
  icon: Icon,
  iconImg,
  title,
  active,
  collapsed,
  onClick,
}: NavLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    onClick?.();
    startTransition(() => {
      router.push(href);
    });
  }

  // Pré-carrega a rota ao passar o mouse — navegação instantânea ao clicar
  function handleMouseEnter() {
    router.prefetch(href);
  }

  const isHighlighted = active || isPending;

  const linkEl = (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group relative flex items-center gap-4 rounded-lg px-4 py-3 text-base transition-colors",
        "text-[hsl(var(--sidebar-fg)/0.75)] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]",
        isHighlighted && "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-fg))] font-medium",
        collapsed && "justify-center px-3"
      )}
    >
      {isHighlighted && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
      )}

      {iconImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconImg}
          alt=""
          aria-hidden
          className={cn(
            "h-[27px] w-[27px] shrink-0 object-contain transition-opacity",
            isHighlighted ? "opacity-100" : "opacity-60 group-hover:opacity-90"
          )}
        />
      ) : (
        <Icon
          className={cn(
            "h-[27px] w-[27px] shrink-0 transition-colors",
            isHighlighted
              ? "text-primary"
              : "text-[hsl(var(--sidebar-fg)/0.65)] group-hover:text-[hsl(var(--sidebar-fg)/0.9)]"
          )}
        />
      )}

      {!collapsed && (
        <span className="truncate flex-1">{title}</span>
      )}

      {/* Spinner sutil durante navegação pendente */}
      {isPending && !collapsed && (
        <span className="h-3 w-3 shrink-0 animate-spin rounded-full border border-[hsl(var(--sidebar-fg)/0.3)] border-t-primary" />
      )}
    </a>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkEl;
}

// ─── Navigation content (reused in both desktop + mobile) ───────────────────

function NavContent({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { userRole, enabledPlatforms } = useTenant();

  const visibleGroups = navGroups
    .filter((g) => !g.visibleFor || g.visibleFor.includes(userRole))
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          userRole === "superadmin" ||
          !item.platform ||
          enabledPlatforms.includes(item.platform)
      ),
    }))
    .filter((g) => g.items.length > 0);

  // Índice do primeiro grupo "Em breve" nos grupos visíveis
  const firstComingSoonIndex = visibleGroups.findIndex((g) => g.comingSoon);

  return (
    <div className="flex flex-col gap-6">
      {visibleGroups.map((group, groupIndex) => (
        <div key={group.label}>
          {/* Separador normal entre grupos */}
          {groupIndex > 0 && groupIndex !== firstComingSoonIndex && (
            <Separator className="mb-4 bg-[hsl(var(--sidebar-border))]" />
          )}


          {/* Separador "Em breve" antes do primeiro grupo comingSoon */}
          {groupIndex === firstComingSoonIndex && (
            <div className="mb-3 mt-1">
              <Separator className="mb-3 bg-[hsl(var(--sidebar-border))]" />
              {!collapsed ? (
                <div className="flex items-center gap-1.5 px-3">
                  <span className="text-[14px] font-bold uppercase tracking-widest text-[hsl(var(--sidebar-fg)/0.65)] dark:text-white dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">
                    Em breve
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-[hsl(var(--sidebar-fg)/0.65)] dark:text-white dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              ) : (
                <p className="sr-only">Em breve</p>
              )}
            </div>
          )}

          {!collapsed ? (
            <p className="mb-2 mt-5 px-4 text-[13px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-fg)/0.55)] first:mt-0">
              {group.label}
            </p>
          ) : (
            <p className="sr-only">{group.label}</p>
          )}

          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  icon={item.icon}
                  iconImg={item.iconImg}
                  title={item.title}
                  active={pathname === item.href}
                  collapsed={collapsed}
                  onClick={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar() {
  const { collapsed } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const isDark = mounted && resolvedTheme === "dark";
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);
  const [tenantOpen, setTenantOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const asideRef = React.useRef<HTMLElement>(null);

  // Visualmente aberta se: pinada pelo toggle OU mouse está sobre ela
  const isOpen = !collapsed || hovered;

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    // Radix porta um wrapper invisível no document.body quando abre qualquer
    // dropdown. Esse wrapper intercepta pointer events e dispara onMouseLeave
    // no <aside> mesmo com o cursor parado sobre a sidebar.
    // Solução: só fechar se o cursor realmente saiu dos limites visuais.
    const rect = asideRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      const stillInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      if (stillInside) return;
    }

    // Mouse saiu de verdade — fecha dropdown primeiro, sidebar depois
    setTenantOpen(false);
    closeTimer.current = setTimeout(() => setHovered(false), 150);
  };

  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <aside
      ref={asideRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "hidden md:flex flex-col h-full shrink-0 overflow-hidden relative",
        "bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]",
        "transition-[width] duration-200 ease-out",
        isOpen ? "w-80" : "w-[88px]"
      )}
      style={isDark ? {
        backgroundImage: "url('/qualifier-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      } : undefined}
    >
      {/* Overlay da cor base com 80% de opacidade para manter o bg-color e deixar a textura em 20% */}
      <div className="absolute inset-0 bg-[hsl(var(--sidebar-bg))]/85 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col h-full w-full">
      {/* Header / Tenant switcher */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-[hsl(var(--sidebar-border))]",
          isOpen ? "px-3" : "px-2 justify-center"
        )}
      >
        <TenantSwitcher
          collapsed={!isOpen}
          open={tenantOpen}
          onOpenChange={setTenantOpen}
        />
      </div>

      {/* Logo Aatlas — sempre visível quando expandida */}
      {isOpen && (
        <div className="shrink-0 px-3 pt-3">
          <div className="h-[72px] w-full overflow-hidden rounded-xl border border-[hsl(var(--sidebar-border))] bg-black flex items-center justify-center px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-aatlas.webp"
              alt="Aatlas Company"
              className="max-h-full w-full object-contain scale-[1.25]"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3">
        <NavContent collapsed={!isOpen} />
      </nav>

      {/* Theme toggle */}
      {isOpen && (
        <div className="shrink-0 flex justify-center border-t border-[hsl(var(--sidebar-border))] py-4">
          <ThemeToggle />
        </div>
      )}
      </div>
    </aside>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
// Drawer customizado sem Radix Sheet — evita o overlay/backdrop que causava
// flash durante a navegação. Fechamento instantâneo (sem animação de saída).

function MobileDrawer() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const isDark = mounted && resolvedTheme === "dark";

  React.useEffect(() => { setMounted(true); }, []);

  // Trava scroll do body quando aberto
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Fecha ao pressionar Escape
  React.useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

  if (!mobileOpen) return null;

  return (
    <>
      {/* Backdrop — sem transição, some instantaneamente ao navegar */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={() => setMobileOpen(false)}
      />

      {/* Painel — sem animação de saída para evitar flash com a navegação */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col md:hidden relative overflow-hidden",
          "bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] shadow-2xl"
        )}
        style={isDark ? {
          backgroundImage: "url('/qualifier-bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        } : undefined}
      >
        <div className="absolute inset-0 bg-[hsl(var(--sidebar-bg))]/85 pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-[hsl(var(--sidebar-border))] px-3">
          <div className="flex-1 min-w-0">
            <TenantSwitcher collapsed={false} />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="shrink-0 rounded-md p-1.5 text-[hsl(var(--sidebar-fg)/0.4)] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Logo Aatlas */}
        <div className="shrink-0 px-3 pt-3">
          <div className="h-[72px] w-full overflow-hidden rounded-xl border border-[hsl(var(--sidebar-border))] flex items-center justify-center px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-aatlas.webp"
              alt="Aatlas Company"
              className="max-h-full w-full object-contain scale-[1.25]"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <NavContent
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </nav>

        {/* Theme toggle */}
        <div className="shrink-0 flex justify-center border-t border-[hsl(var(--sidebar-border))] py-4">
          <ThemeToggle />
        </div>
        </div>
      </div>
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <TooltipProvider delayDuration={100}>
      <DesktopSidebar />
      <MobileDrawer />
    </TooltipProvider>
  );
}
