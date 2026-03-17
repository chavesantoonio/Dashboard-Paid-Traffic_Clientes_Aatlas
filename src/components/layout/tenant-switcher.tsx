"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "./tenant-context";

interface TenantSwitcherProps {
  collapsed?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TenantSwitcher({
  collapsed = false,
  open: _open,
  onOpenChange: _onOpenChange,
}: TenantSwitcherProps) {
  const { workspace } = useTenant();

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg p-2 text-left",
        "text-[hsl(var(--sidebar-fg))]",
        collapsed && "justify-center p-1.5"
      )}
    >
      {/* Avatar do workspace */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold",
          workspace.color
        )}
      >
        {workspace.initials}
      </div>

      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none">
              {workspace.name}
            </p>
            <p className="mt-0.5 text-xs text-[hsl(var(--sidebar-fg)/0.5)]">
              {workspace.subtitle}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--sidebar-fg)/0.4)]" />
        </>
      )}
    </div>
  );
}
