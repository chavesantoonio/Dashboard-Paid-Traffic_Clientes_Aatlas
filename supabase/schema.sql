-- =============================================================================
-- DASH B2B — Schema PostgreSQL para Supabase
-- Plataformas: Meta Ads, Google Ads, GMB, GA4
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor > New Query)
-- =============================================================================


-- =============================================================================
-- 0. RESET — Remove objetos anteriores (safe re-run)
-- =============================================================================

DROP TRIGGER  IF EXISTS on_auth_user_created        ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_superadmin()        CASCADE;
DROP FUNCTION IF EXISTS public.get_my_organization_id() CASCADE;

DROP TABLE IF EXISTS public.daily_metrics      CASCADE;
DROP TABLE IF EXISTS public.platform_accounts  CASCADE;
DROP TABLE IF EXISTS public.users              CASCADE;
DROP TABLE IF EXISTS public.organizations      CASCADE;

DROP TYPE IF EXISTS public.platform_type CASCADE;
DROP TYPE IF EXISTS public.user_role     CASCADE;
DROP TYPE IF EXISTS public.ad_platform   CASCADE;


-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

CREATE TYPE public.user_role AS ENUM (
    'superadmin',
    'clientadmin',
    'clientviewer'
);

CREATE TYPE public.platform_type AS ENUM (
    'meta',
    'google_ads',
    'gmb',
    'ga4'
);


-- =============================================================================
-- 2. TABELA: organizations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Empresas/clientes cadastrados no dashboard B2B.';


-- =============================================================================
-- 3. TABELA: users (espelho público de auth.users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id               UUID             PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id  UUID             NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role             public.user_role NOT NULL DEFAULT 'clientviewer',
    name             TEXT             NOT NULL,
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.users IS 'Perfil público dos usuários, vinculado ao auth.users do Supabase.';
COMMENT ON COLUMN public.users.id IS 'Mesmo UUID do auth.users — chave primária e FK.';
COMMENT ON COLUMN public.users.role IS 'superadmin: acesso total | clientadmin/clientviewer: restrito à própria organização.';


-- =============================================================================
-- 4. TABELA: platform_accounts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.platform_accounts (
    id               UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID                 NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    platform         public.platform_type NOT NULL,
    account_id       TEXT                 NOT NULL,  -- ID externo da plataforma
    account_name     TEXT,                           -- Nome legível (opcional)
    is_active        BOOLEAN              NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ          NOT NULL DEFAULT now(),

    -- Mesma conta não pode pertencer a 2 organizações
    UNIQUE (platform, account_id)
);

COMMENT ON TABLE  public.platform_accounts IS 'Contas de plataforma vinculadas a cada organização. Usada pelo n8n para saber qual conta buscar dados de qual cliente.';
COMMENT ON COLUMN public.platform_accounts.account_id IS 'ID externo: Meta=act_123456 | Google Ads=123-456-7890 | GMB=ChIJ... | GA4=properties/123456';


-- =============================================================================
-- 5. TABELA: daily_metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id               UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID                 NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    platform         public.platform_type NOT NULL,
    date             DATE                 NOT NULL,

    -- Financeiro
    spend                DECIMAL(12, 2),  -- Investimento em anúncios (R$)

    -- Volume / Vaidade
    impressions          INTEGER,         -- Impressões totais
    reach                INTEGER,         -- Alcance único
    sessions             INTEGER,         -- Sessões (GA4)
    engaged_sessions     INTEGER,         -- Sessões engajadas (GA4)
    pageviews            INTEGER,         -- Visualizações de página (GA4)
    profile_views        INTEGER,         -- Visualizações do perfil (GMB)
    search_queries       INTEGER,         -- Buscas que exibiram o negócio (GMB)

    -- Engajamento / Tráfego
    link_clicks          INTEGER,         -- Cliques em links (Meta)
    outbound_clicks      INTEGER,         -- Cliques externos (Meta)
    clicks               INTEGER,         -- Cliques totais (Google Ads / GA4)
    post_engagements     INTEGER,         -- Engajamentos em posts (Meta)
    video_views          INTEGER,         -- Visualizações de vídeo (Meta)
    interactions         INTEGER,         -- Interações totais (Google Ads)
    website_clicks       INTEGER,         -- Cliques no site pelo GMB

    -- Conversão
    messages_started     INTEGER,         -- Conversas iniciadas (Meta / GMB)
    leads                INTEGER,         -- Leads gerados
    conversions          INTEGER,         -- Conversões rastreadas
    calls                INTEGER,         -- Ligações (GMB / Google Ads)
    directions_clicks    INTEGER,         -- Cliques em "Como chegar" (GMB)
    custom_events        INTEGER,         -- Eventos customizados (GA4)

    -- Constraint de unicidade: 1 registro por org + plataforma + dia
    UNIQUE (organization_id, platform, date)
);

COMMENT ON TABLE public.daily_metrics IS 'Métricas diárias consolidadas por organização e plataforma (Meta, Google Ads, GMB, GA4).';


-- =============================================================================
-- 5. INDEXES (performance nas queries mais comuns)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_organization_id
    ON public.users (organization_id);

CREATE INDEX IF NOT EXISTS idx_platform_accounts_organization_id
    ON public.platform_accounts (organization_id);

CREATE INDEX IF NOT EXISTS idx_platform_accounts_platform
    ON public.platform_accounts (platform);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_organization_id
    ON public.daily_metrics (organization_id);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date
    ON public.daily_metrics (date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_org_platform_date
    ON public.daily_metrics (organization_id, platform, date DESC);


-- =============================================================================
-- 6. ROW LEVEL SECURITY — Habilitar em todas as tabelas
-- =============================================================================

ALTER TABLE public.organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics      ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- 7. FUNÇÕES HELPER (usadas nas RLS policies)
-- =============================================================================

-- Retorna o organization_id do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_my_organization_id() IS
    'Retorna o organization_id do usuário autenticado. Usada nas RLS policies.';


-- Retorna TRUE se o usuário autenticado for superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role = 'superadmin'
    );
$$;

COMMENT ON FUNCTION public.is_superadmin() IS
    'Retorna TRUE se o usuário autenticado tiver role = superadmin.';


-- =============================================================================
-- 8. RLS POLICIES — organizations
-- =============================================================================

-- Superadmin vê todas as organizações
CREATE POLICY "superadmin_select_organizations"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (public.is_superadmin());

-- clientadmin / clientviewer veem apenas a própria organização
CREATE POLICY "user_select_own_organization"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (id = public.get_my_organization_id());

-- Apenas superadmin pode inserir / atualizar / deletar organizações
CREATE POLICY "superadmin_all_organizations"
    ON public.organizations
    FOR ALL
    TO authenticated
    USING (public.is_superadmin())
    WITH CHECK (public.is_superadmin());


-- =============================================================================
-- 9. RLS POLICIES — users
-- =============================================================================

-- Superadmin vê todos os usuários
CREATE POLICY "superadmin_select_users"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (public.is_superadmin());

-- clientadmin / clientviewer veem apenas colegas da mesma organização
CREATE POLICY "user_select_same_organization"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (organization_id = public.get_my_organization_id());

-- Usuário pode atualizar o próprio perfil (sem alterar role ou org)
CREATE POLICY "user_update_own_profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND role = (SELECT role FROM public.users WHERE id = auth.uid())
        AND organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    );

-- Apenas superadmin pode inserir / atualizar / deletar usuários
CREATE POLICY "superadmin_all_users"
    ON public.users
    FOR ALL
    TO authenticated
    USING (public.is_superadmin())
    WITH CHECK (public.is_superadmin());


-- =============================================================================
-- 10. RLS POLICIES — platform_accounts
-- =============================================================================

-- Superadmin vê todas as contas
CREATE POLICY "superadmin_select_platform_accounts"
    ON public.platform_accounts
    FOR SELECT
    TO authenticated
    USING (public.is_superadmin());

-- clientadmin / clientviewer veem apenas contas da própria organização
CREATE POLICY "user_select_own_platform_accounts"
    ON public.platform_accounts
    FOR SELECT
    TO authenticated
    USING (organization_id = public.get_my_organization_id());

-- Apenas superadmin pode inserir / atualizar / deletar contas de plataforma
CREATE POLICY "superadmin_all_platform_accounts"
    ON public.platform_accounts
    FOR ALL
    TO authenticated
    USING (public.is_superadmin())
    WITH CHECK (public.is_superadmin());


-- =============================================================================
-- 11. RLS POLICIES — daily_metrics
-- =============================================================================

-- Superadmin vê todas as métricas
CREATE POLICY "superadmin_select_metrics"
    ON public.daily_metrics
    FOR SELECT
    TO authenticated
    USING (public.is_superadmin());

-- clientadmin / clientviewer veem apenas métricas da própria organização
CREATE POLICY "user_select_own_metrics"
    ON public.daily_metrics
    FOR SELECT
    TO authenticated
    USING (organization_id = public.get_my_organization_id());

-- Apenas superadmin pode inserir / atualizar / deletar métricas
CREATE POLICY "superadmin_all_metrics"
    ON public.daily_metrics
    FOR ALL
    TO authenticated
    USING (public.is_superadmin())
    WITH CHECK (public.is_superadmin());


-- =============================================================================
-- 12. FUNCTION + TRIGGER: auto-inserir em public.users no signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, organization_id, role, name, created_at)
    VALUES (
        NEW.id,
        -- organization_id deve vir no metadata do signup (obrigatório)
        (NEW.raw_user_meta_data->>'organization_id')::UUID,
        -- Role padrão: clientviewer; superadmin deve ser promovido manualmente
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            'clientviewer'
        ),
        -- Nome: metadata['name'] ou email como fallback
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Idempotente: ignora re-execuções

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS
    'Cria automaticamente um perfil em public.users ao registrar em auth.users.';

-- Remove trigger anterior se existir (safe re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();


-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
