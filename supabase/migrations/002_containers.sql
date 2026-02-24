-- Tabla de contenedores
CREATE TABLE IF NOT EXISTS containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  origin_warehouse TEXT NOT NULL CHECK (origin_warehouse IN ('HK', 'CH', 'USA')),
  container_type TEXT NOT NULL CHECK (container_type IN ('20', '40', '40HC')),
  status TEXT NOT NULL DEFAULT 'deposito' CHECK (status IN ('deposito', 'transito', 'aduana', 'finalizado')),
  description TEXT,
  eta DATE,
  etd DATE,
  exchange_rate DECIMAL(12,2),
  exchange_rate_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON containers
  FOR ALL USING (auth.role() = 'authenticated');

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
