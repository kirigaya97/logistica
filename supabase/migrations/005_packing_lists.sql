-- Tabla de packing lists (1:1 con contenedor)
CREATE TABLE IF NOT EXISTS packing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  file_name TEXT,
  imported_at TIMESTAMPTZ DEFAULT now(),
  total_items INTEGER DEFAULT 0,
  total_weight_kg DECIMAL(12,2) DEFAULT 0,
  total_volume_m3 DECIMAL(12,4) DEFAULT 0,
  UNIQUE(container_id)
);

ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON packing_lists
  FOR ALL USING (auth.role() = 'authenticated');

-- Tabla de items individuales del packing list
CREATE TABLE IF NOT EXISTS packing_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_list_id UUID NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg DECIMAL(12,2),
  height_cm DECIMAL(10,2),
  width_cm DECIMAL(10,2),
  depth_cm DECIMAL(10,2),
  volume_m3 DECIMAL(12,4),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE packing_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON packing_list_items
  FOR ALL USING (auth.role() = 'authenticated');
