-- Adiciona coluna ad_name à tabela daily_metrics.
-- Nullable para não quebrar dados históricos já existentes.

ALTER TABLE public.daily_metrics
ADD COLUMN ad_name text;
