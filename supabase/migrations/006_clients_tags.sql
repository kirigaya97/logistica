-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  international_rate DECIMAL(12,2),
  local_rate DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Historial de tarifas de clientes
CREATE TABLE IF NOT EXISTS client_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('international', 'local')),
  old_value DECIMAL(12,2),
  new_value DECIMAL(12,2),
  changed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_rate_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON client_rate_history
  FOR ALL USING (auth.role() = 'authenticated');

-- Tabla de etiquetas
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(normalized_name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Tabla de relación items-etiquetas (many-to-many)
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES packing_list_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(item_id, tag_id)
);

ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON item_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Agregar client_id a packing_list_items
ALTER TABLE packing_list_items
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_packing_list_items_client ON packing_list_items(client_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_client_rate_history_client ON client_rate_history(client_id);
