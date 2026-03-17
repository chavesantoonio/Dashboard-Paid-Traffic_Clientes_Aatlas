"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateSafe(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? d : undefined;
}

function toISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DateRangePicker({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Datas confirmadas na URL (fonte da verdade)
  const committedFrom = toDateSafe(searchParams.get("from"));
  const committedTo   = toDateSafe(searchParams.get("to"));

  // 1. Controle manual do Popover
  const [isOpen, setIsOpen] = React.useState(false);

  // 2. Estado local de seleção — não altera a URL enquanto o usuário navega
  const [localRange, setLocalRange] = React.useState<DateRange | undefined>(
    { from: committedFrom, to: committedTo }
  );

  // Ao abrir o Popover, sincroniza o estado local com o que está na URL
  function handleOpenChange(open: boolean) {
    if (open) setLocalRange({ from: committedFrom, to: committedTo });
    setIsOpen(open);
  }

  // 3. Botão Aplicar — única mutação da URL
  function handleApply() {
    const params = new URLSearchParams(searchParams.toString());

    if (localRange?.from && localRange?.to) {
      params.set("from", toISO(localRange.from));
      params.set("to",   toISO(localRange.to));
    } else {
      params.delete("from");
      params.delete("to");
    }

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    setLocalRange(undefined);
    router.push(`${pathname}?${params.toString()}`);
  }

  // Rótulo do trigger — reflete o que está na URL (committedFrom/To)
  let triggerLabel: React.ReactNode;
  if (committedFrom && committedTo) {
    triggerLabel = (
      <>
        {format(committedFrom, "dd MMM yyyy", { locale: ptBR })}
        {" — "}
        {format(committedTo, "dd MMM yyyy", { locale: ptBR })}
      </>
    );
  } else if (committedFrom) {
    triggerLabel = format(committedFrom, "dd MMM yyyy", { locale: ptBR });
  } else {
    triggerLabel = <span className="text-muted-foreground">Selecionar período</span>;
  }

  const canApply = Boolean(localRange?.from && localRange?.to);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 justify-start gap-2 rounded-lg border-border bg-card px-4 text-sm font-normal text-card-foreground hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-card"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-[#FF6200]" />
            {triggerLabel}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="end">
          {/* 2. Calendar só atualiza estado local */}
          <Calendar
            mode="range"
            selected={localRange}
            onSelect={setLocalRange}
            numberOfMonths={2}
            locale={ptBR}
            disabled={{ after: new Date() }}
          />

          {/* Rodapé com botão Aplicar */}
          <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={!canApply}
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Limpar — só aparece quando há datas confirmadas na URL */}
      {(committedFrom || committedTo) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          aria-label="Limpar filtro de datas"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
