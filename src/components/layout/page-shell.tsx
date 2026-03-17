import React from "react";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbEntry } from "@/lib/nav-config";

interface PageShellProps {
  title: string;
  breadcrumbs: BreadcrumbEntry[];
  children?: React.ReactNode;
  /** Slot opcional para botões/filtros ao lado do título */
  actions?: React.ReactNode;
  /** Ícone webp opcional exibido ao lado do título */
  iconImg?: string;
}

export function PageShell({ title, breadcrumbs, children, actions, iconImg }: PageShellProps) {
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-sm text-foreground">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-sm text-muted-foreground">{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header: title + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground tracking-tight">
          {iconImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconImg} alt="" aria-hidden className="h-7 w-7 shrink-0 object-contain" />
          )}
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Page content */}
      {children ?? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Conteúdo desta página será adicionado em breve.
          </p>
        </div>
      )}
    </div>
  );
}
