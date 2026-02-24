-- Create cost_template_config table
CREATE TABLE IF NOT EXISTS cost_template_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one default template exists (simplified approach)
CREATE UNIQUE INDEX IF NOT EXISTS one_default_template_idx ON cost_template_config (is_default) WHERE is_default = true;

-- Create cost_simulations table
CREATE TABLE IF NOT EXISTS cost_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fob_total DECIMAL(12,2) DEFAULT 0,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE cost_template_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users full access to cost_template_config"
  ON cost_template_config FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users full access to cost_simulations"
  ON cost_simulations FOR ALL
  TO authenticated
  USING (true);

-- Seed with initial default if not exists
INSERT INTO cost_template_config (name, is_default, items)
VALUES ('Default Template', true, '[
  {"category": "1_cif", "name": "Flete Oceánico", "valueType": "fixed", "base": "input", "value": 0, "isActive": true, "sort_order": 0},
  {"category": "1_cif", "name": "BAF", "valueType": "fixed", "base": "input", "value": 0, "isActive": true, "sort_order": 1},
  {"category": "1_cif", "name": "Seguro", "valueType": "fixed", "base": "input", "value": 0, "isActive": true, "sort_order": 2},
  {"category": "2_tributos", "name": "Derechos", "valueType": "percentage", "base": "cif", "value": 12.6, "isActive": true, "sort_order": 3},
  {"category": "2_tributos", "name": "Tasa Estadística", "valueType": "percentage", "base": "cif", "value": 3, "isActive": true, "sort_order": 4},
  {"category": "3_impuestos", "name": "IVA", "valueType": "percentage", "base": "base_imponible", "value": 21, "isActive": true, "sort_order": 5},
  {"category": "3_impuestos", "name": "Percepción IVA", "valueType": "percentage", "base": "base_imponible", "value": 20, "isActive": true, "sort_order": 6},
  {"category": "3_impuestos", "name": "Percepción Ganancias", "valueType": "percentage", "base": "base_imponible", "value": 6, "isActive": true, "sort_order": 7},
  {"category": "3_impuestos", "name": "Percepción IIBB", "valueType": "percentage", "base": "base_imponible", "value": 3, "isActive": true, "sort_order": 8},
  {"category": "4_gastos_op", "name": "Costos Agencia", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 9},
  {"category": "4_gastos_op", "name": "IVA s/ Agencia", "valueType": "percentage", "base": "costos_agencia", "value": 10.5, "isActive": true, "sort_order": 10},
  {"category": "4_gastos_op", "name": "Terminal Portuaria", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 11},
  {"category": "4_gastos_op", "name": "Acarreo GBA", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 12},
  {"category": "4_gastos_op", "name": "Honorarios Despacho", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 13},
  {"category": "4_gastos_op", "name": "Gastos Despacho", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 14},
  {"category": "4_gastos_op", "name": "Gastos Bancarios", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 15},
  {"category": "4_gastos_op", "name": "Gastos Bancarios Ext.", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 16},
  {"category": "4_gastos_op", "name": "Imp. Transf.", "valueType": "percentage", "base": "total_gastos_locales", "value": 1.2, "isActive": true, "sort_order": 17},
  {"category": "5_gastos_ext", "name": "Agentes Exterior", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 18},
  {"category": "5_gastos_ext", "name": "Depósito Ext.", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 19},
  {"category": "5_gastos_ext", "name": "Fee", "valueType": "fixed", "base": null, "value": 0, "isActive": true, "sort_order": 20}
]')
ON CONFLICT DO NOTHING;
