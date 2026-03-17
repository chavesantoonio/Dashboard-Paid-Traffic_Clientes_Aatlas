"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  if (!mounted) return <div className="w-[94px] h-[47px]" />;

  function handleClick() {
    const next = !isDark;
    setIsDark(next);
    setTheme(next ? "dark" : "light");
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-pressed={isDark}
        aria-label="Alternar tema"
        onClick={handleClick}
        className={`relative flex justify-between items-center w-[94px] h-[47px] rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary bg-[hsl(var(--sidebar-accent))] border border-[hsl(var(--sidebar-border))]`}
      >
        {/* Sol */}
        <div className={`w-1/2 flex justify-center z-10 transition-opacity duration-300 ${isDark ? "opacity-30" : "opacity-100"}`}>
          <Sun className="h-4 w-4 text-amber-400" aria-hidden />
        </div>

        {/* Lua */}
        <div className={`w-1/2 flex justify-center z-10 transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-30"}`}>
          <Moon
            className="h-4 w-4 text-[hsl(var(--sidebar-bg))]"
            aria-hidden
          />
        </div>

        {/* Bola */}
        <div
          style={{ transform: isDark ? "translateX(47px)" : "translateX(0px)" }}
          className={`absolute w-[34px] h-[34px] top-[6.5px] left-[6.5px] rounded-full [transition:transform_300ms_ease-in-out,background-color_300ms_ease-in-out] ${
            "bg-[hsl(var(--sidebar-fg))]"
          }`}
        />
      </button>

      <span className="text-sm font-medium text-[hsl(var(--sidebar-fg)/0.7)] select-none">
        {isDark ? "Dark mode" : "Light mode"}
      </span>
    </div>
  );
}
