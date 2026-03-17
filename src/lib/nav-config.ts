import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  Store,
  AreaChart,
  Settings,
  Sparkles,
  ShoppingCart,
  Contact2,
  Megaphone,
  Trophy,
  Wallet,
  UserCog,
  ListFilter,
  Zap,
  Handshake,
  Headphones,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Caminho para imagem webp a usar no lugar do ícone Lucide */
  iconImg?: string;
  /** Se definido, o item só aparece se a plataforma estiver habilitada para a org */
  platform?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  /** Se definido, a seção só aparece para as roles listadas */
  visibleFor?: string[];
  /** Agrupa a seção sob o separador "Em breve" na sidebar */
  comingSoon?: boolean;
}

export const navGroups: NavGroup[] = [
  {
    label: "Agência",
    visibleFor: ["superadmin"],
    items: [
      {
        title: "Visão Global",
        href: "/visao-global",
        icon: LayoutDashboard,
      },
      {
        title: "Gestão de Clientes",
        href: "/gestao-clientes",
        icon: Users,
      },
      {
        title: "Utilizadores",
        href: "/usuarios",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Relatórios",
    items: [
      {
        title: "Dashboard Resumo",
        href: "/relatorios/dashboard-resumo",
        icon: BarChart3,
        iconImg: "/icons/platforms/powerbi.webp",
      },
      {
        title: "Meta Ads",
        href: "/relatorios/meta-ads",
        icon: Target,
        iconImg: "/icons/platforms/meta-ads.webp",
        platform: "meta",
      },
      {
        title: "Google Ads",
        href: "/relatorios/google-ads",
        icon: TrendingUp,
        iconImg: "/icons/platforms/google-ads.webp",
        platform: "google_ads",
      },
      {
        title: "Google Meu Negócio",
        href: "/relatorios/google-meu-negocio",
        icon: Store,
        iconImg: "/icons/platforms/gmb.webp",
        platform: "gmb",
      },
      {
        title: "Google Analytics",
        href: "/relatorios/google-analytics",
        icon: AreaChart,
        iconImg: "/icons/platforms/ga4.webp",
        platform: "ga4",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Configurações",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
  {
    label: "Inteligência",
    comingSoon: true,
    visibleFor: ["superadmin"],
    items: [
      {
        title: "Dashboard IA",
        href: "/dashboard-ia",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Comercial",
    comingSoon: true,
    visibleFor: ["superadmin"],
    items: [
      {
        title: "Gestão de Leads Globais",
        href: "/gestao-leads",
        icon: ListFilter,
      },
      {
        title: "Automação de Prospecção",
        href: "/automacao-prospeccao",
        icon: Zap,
      },
      {
        title: "Campanhas",
        href: "/campanhas",
        icon: Megaphone,
      },
      {
        title: "Contatos",
        href: "/contatos",
        icon: Contact2,
      },
      {
        title: "Pedidos",
        href: "/pedidos",
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: "Sucesso do Cliente",
    comingSoon: true,
    visibleFor: ["superadmin"],
    items: [
      {
        title: "Customer Success Global",
        href: "/customer-success",
        icon: Handshake,
      },
      {
        title: "Suporte Multicanal",
        href: "/suporte-multicanal",
        icon: Headphones,
      },
    ],
  },
  {
    label: "Gestão",
    comingSoon: true,
    visibleFor: ["superadmin"],
    items: [
      {
        title: "Metas",
        href: "/metas",
        icon: Trophy,
      },
      {
        title: "Financeiro",
        href: "/financeiro",
        icon: Wallet,
      },
    ],
  },
];

/** Ícone webp por rota — só para páginas de plataforma */
export const pageIconImgs: Record<string, string> = {
  "/relatorios/dashboard-resumo":  "/icons/platforms/powerbi.webp",
  "/relatorios/meta-ads":          "/icons/platforms/meta-ads.webp",
  "/relatorios/google-ads":        "/icons/platforms/google-ads.webp",
  "/relatorios/google-meu-negocio": "/icons/platforms/gmb.webp",
  "/relatorios/google-analytics":  "/icons/platforms/ga4.webp",
};

export const pageTitles: Record<string, string> = {
  "/visao-global": "Visão Global",
  "/gestao-clientes": "Gestão de Clientes",
  "/dashboard-ia": "Dashboard IA",
  "/gestao-leads": "Gestão de Leads Globais",
  "/automacao-prospeccao": "Automação de Prospecção",
  "/campanhas": "Campanhas",
  "/contatos": "Contatos",
  "/pedidos": "Pedidos",
  "/customer-success": "Customer Success Global",
  "/suporte-multicanal": "Suporte Multicanal",
  "/relatorios/dashboard-resumo": "Dashboard Resumo",
  "/relatorios/meta-ads": "Meta Ads",
  "/relatorios/google-ads": "Google Ads",
  "/relatorios/google-meu-negocio": "Google Meu Negócio",
  "/relatorios/google-analytics": "Google Analytics",
  "/metas": "Metas",
  "/financeiro": "Financeiro",
  "/usuarios": "Utilizadores",
  "/configuracoes": "Configurações",
  "/perfil": "Meu Perfil",
};

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export const pageBreadcrumbs: Record<string, BreadcrumbEntry[]> = {
  "/visao-global": [{ label: "Agência" }, { label: "Visão Global" }],
  "/gestao-clientes": [{ label: "Agência" }, { label: "Gestão de Clientes" }],
  "/dashboard-ia": [{ label: "Inteligência" }, { label: "Dashboard IA" }],
  "/gestao-leads": [{ label: "Comercial" }, { label: "Gestão de Leads Globais" }],
  "/automacao-prospeccao": [{ label: "Comercial" }, { label: "Automação de Prospecção" }],
  "/campanhas": [{ label: "Comercial" }, { label: "Campanhas" }],
  "/contatos": [{ label: "Comercial" }, { label: "Contatos" }],
  "/pedidos": [{ label: "Comercial" }, { label: "Pedidos" }],
  "/customer-success": [{ label: "Sucesso do Cliente" }, { label: "Customer Success Global" }],
  "/suporte-multicanal": [{ label: "Sucesso do Cliente" }, { label: "Suporte Multicanal" }],
  "/relatorios/dashboard-resumo": [{ label: "Relatórios" }, { label: "Dashboard Resumo" }],
  "/relatorios/meta-ads": [{ label: "Relatórios" }, { label: "Meta Ads" }],
  "/relatorios/google-ads": [{ label: "Relatórios" }, { label: "Google Ads" }],
  "/relatorios/google-meu-negocio": [{ label: "Relatórios" }, { label: "Google Meu Negócio" }],
  "/relatorios/google-analytics": [{ label: "Relatórios" }, { label: "Google Analytics" }],
  "/metas": [{ label: "Gestão" }, { label: "Metas" }],
  "/financeiro": [{ label: "Gestão" }, { label: "Financeiro" }],
  "/usuarios": [{ label: "Agência" }, { label: "Utilizadores" }],
  "/configuracoes": [{ label: "Sistema" }, { label: "Configurações" }],
};
