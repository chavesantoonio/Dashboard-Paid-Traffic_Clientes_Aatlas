-- Adiciona coluna de status à tabela organizations.
-- Valores permitidos: 'active' | 'suspended'
-- Default 'active' garante que todas as orgs existentes continuam ativas.

ALTER TABLE public.organizations
ADD COLUMN status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'suspended'));
