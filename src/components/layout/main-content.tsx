"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasTexture = pathname?.startsWith("/relatorios") && mounted && resolvedTheme === "dark";

  return (
    <main
      className="flex-1"
      style={hasTexture ? {
        backgroundImage: `linear-gradient(rgba(9,9,11,0.80), rgba(9,9,11,0.80)), url('/textura-glass-energy.webp')`,
        backgroundSize: "100% 100%, 100% 100%",
        backgroundAttachment: "fixed, fixed",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      } : undefined}
    >
      <div className="mx-auto max-w-7xl p-6">
        {children}
      </div>
    </main>
  );
}
