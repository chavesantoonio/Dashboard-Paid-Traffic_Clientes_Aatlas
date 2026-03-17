"use client";

import * as React from "react";

export interface WorkspaceInfo {
  orgId: string;
  name: string;
  subtitle: string;
  initials: string;
  color: string; // classe Tailwind para o avatar
}

interface TenantContextValue {
  workspace: WorkspaceInfo;
  userRole: string;
  enabledPlatforms: string[];
}

const TenantContext = React.createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: React.ReactNode;
  workspace: WorkspaceInfo;
  userRole: string;
  enabledPlatforms: string[];
}

export function TenantProvider({
  children,
  workspace,
  userRole,
  enabledPlatforms,
}: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ workspace, userRole, enabledPlatforms }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = React.useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
