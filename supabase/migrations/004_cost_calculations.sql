-- Tabla de cálculos de costos
CREATE TABLE IF NOT EXISTS cost_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  fob_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  exchange_rate DECIMAL(12,2),
  exchange_rate_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cost_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON cost_calculations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER cost_calculations_updated_at
  BEFORE UPDATE ON cost_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tabla de ítems individuales de costo
CREATE TABLE IF NOT EXISTS cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID NOT NULL REFERENCES cost_calculations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('fixed', 'percentage')),
  base TEXT,
  value DECIMAL(12,4) NOT NULL DEFAULT 0,
  calculated_value DECIMAL(12,4),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  -- Client overrides
  client_value DECIMAL(12,4),
  client_active BOOLEAN,
  client_label TEXT,
  client_only BOOLEAN DEFAULT false
);

ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON cost_items
  FOR ALL USING (auth.role() = 'authenticated');
