"use client";

import * as React from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  toggleCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggleCollapsed: () => setCollapsed((v) => !v),
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return React.useContext(SidebarContext);
}
