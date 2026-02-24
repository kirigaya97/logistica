-- Add snapshot column to store full calculation result
ALTER TABLE cost_simulations 
  ADD COLUMN IF NOT EXISTS snapshot JSONB;

-- Drop the unique constraint on is_default (allows multiple templates)
DROP INDEX IF EXISTS one_default_template_idx;

-- Add slug column for programmatic identification
ALTER TABLE cost_template_config 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing default template
UPDATE cost_template_config 
  SET slug = 'default', name = 'Plantilla Base'
  WHERE is_default = true;

-- Seed "Salida Real" template (same items, user configures different values in config page)
INSERT INTO cost_template_config (name, slug, is_default, items)
SELECT 'Salida Real', 'salida_real', false, items
FROM cost_template_config WHERE slug = 'default'
ON CONFLICT (slug) DO NOTHING;

-- Seed "Salida Cliente" template (same items, user configures different values in config page)
INSERT INTO cost_template_config (name, slug, is_default, items)
SELECT 'Salida Cliente', 'salida_cliente', false, items
FROM cost_template_config WHERE slug = 'default'
ON CONFLICT (slug) DO NOTHING;
