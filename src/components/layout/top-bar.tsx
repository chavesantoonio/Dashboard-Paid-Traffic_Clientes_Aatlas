"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Menu, LogOut, User, Settings } from "lucide-react";


import { cn } from "@/lib/utils";
import { pageTitles, pageIconImgs } from "@/lib/nav-config";
import { useSidebar } from "./sidebar-context";
import { useUserAvatar } from "./user-avatar-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface TopBarProps {
  user: UserProfile;
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileOpen } = useSidebar();
  const { avatarUrl } = useUserAvatar();

  const pageTitle   = pageTitles[pathname] ?? "Dashboard";
  const pageIconImg = pageIconImgs[pathname];

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-3 px-4 md:px-6 bg-background/40 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/15 dark:border-white/10 rounded-bl-[30px] rounded-br-[30px]"
      style={{ boxShadow: "0 1px 24px 0 rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.18)" }}
    >
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <h1 className="flex flex-1 items-center gap-2 text-[21px] font-semibold text-foreground tracking-tight truncate">
        {pageIconImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pageIconImg} alt="" aria-hidden className="h-[27px] w-[27px] shrink-0 object-contain" />
        )}
        {pageTitle}
      </h1>

      <div className="flex items-center gap-1">
        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-[54px] w-[54px] rounded-full p-0"
              aria-label="Menu do perfil"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl ?? ""} alt={user.name} />
                <AvatarFallback
                  className={cn("text-sm font-semibold", "bg-primary text-white")}
                >
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl ?? ""} alt={user.name} />
                  <AvatarFallback className="text-xs bg-primary text-white font-semibold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-none">
                    {user.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-none">
                    {user.email}
                  </p>
                  {user.role && (
                    <p className="mt-1 text-xs text-muted-foreground/70 leading-none capitalize">
                      {user.role}
                    </p>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {!isMobile && (
              <>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => router.push("/perfil")}
                >
                  <User className="h-4 w-4" />
                  <span>Meu perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => router.push("/configuracoes")}
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
