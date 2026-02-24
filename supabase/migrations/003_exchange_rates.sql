-- Tabla de registro histórico de tipo de cambio
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type TEXT NOT NULL CHECK (rate_type IN ('blue', 'oficial', 'bolsa', 'contadoconliqui')),
  buy DECIMAL(12,2) NOT NULL,
  sell DECIMAL(12,2) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON exchange_rates
  FOR ALL USING (auth.role() = 'authenticated');
