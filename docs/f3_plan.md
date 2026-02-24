# F3 — Calculators (Plan Detallado)

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Skills a leer antes**:
- `.agents/skills/cost-calculator/SKILL.md`
- `.agents/skills/exchange-rate/SKILL.md`
- `.agents/skills/supabase-patterns/SKILL.md`

**Prerequisito**: F2.1 completado y verificado.
**No instalar paquetes nuevos** — todo lo necesario ya está instalado.

---

## F3.1 — Calculadora Volumétrica + Tipo de Cambio

> ⚠️ F3.1 es INDEPENDIENTE de F3.2. Se puede ejecutar primero porque NO requiere F2.2 ni F2.3.

---

### Paso 1: Crear migración SQL para tipo de cambio

📄 `supabase/migrations/003_exchange_rates.sql`

```sql
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
```

**Acción**: Ejecutar en el SQL Editor de Supabase usando el MCP tool `apply_migration`.

---

### Paso 2: Crear API proxy para DolarAPI

📄 `src/app/api/exchange-rate/route.js`

```javascript
export async function GET() {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares', {
      next: { revalidate: 300 } // Cache 5 minutos
    })
    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: 'Error al obtener tipos de cambio' },
      { status: 500 }
    )
  }
}
```

---

### Paso 3: Crear hook useExchangeRate

📄 `src/hooks/useExchangeRate.js`

```javascript
'use client'
import { useState, useEffect } from 'react'

export function useExchangeRate() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => {
        if (!r.ok) throw new Error('Error al obtener cotizaciones')
        return r.json()
      })
      .then(setRates)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { rates, loading, error }
}
```

---

### Paso 4: Crear ExchangeRateSelector component

📄 `src/components/calculadora/ExchangeRateSelector.js`

```javascript
'use client'

import { useExchangeRate } from '@/hooks/useExchangeRate'

const RATE_LABELS = {
  blue: '💵 Dólar Blue',
  oficial: '🏛️ Dólar Oficial',
  bolsa: '📈 Dólar Bolsa (MEP)',
  contadoconliqui: '💱 Dólar CCL',
}

export default function ExchangeRateSelector({ value, onChange }) {
  const { rates, loading, error } = useExchangeRate()

  if (loading) return <p className="text-sm text-gray-400">Cargando cotizaciones...</p>
  if (error) return <p className="text-sm text-red-400">Error: {error}</p>

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Tipo de Cambio</label>
      <div className="grid grid-cols-2 gap-3">
        {rates.map((rate) => {
          const label = RATE_LABELS[rate.casa] || rate.nombre
          const isSelected = value?.type === rate.casa
          return (
            <button
              key={rate.casa}
              type="button"
              onClick={() => onChange({ type: rate.casa, buy: rate.compra, sell: rate.venta })}
              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-medium">{label}</p>
              <p className="text-gray-500 text-xs mt-1">
                Compra: ${rate.compra?.toLocaleString('es-AR')} — Venta: ${rate.venta?.toLocaleString('es-AR')}
              </p>
            </button>
          )
        })}
      </div>

      {value && (
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Override manual (opcional)</label>
          <input
            type="number"
            step="0.01"
            value={value.sell || ''}
            onChange={(e) => onChange({ ...value, sell: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Valor manual..."
          />
        </div>
      )}
    </div>
  )
}
```

---

### Paso 5: Crear lógica de cálculo volumétrico

📄 `src/lib/calculadora/volumetric.js`

```javascript
/**
 * Calcula cuántas cajas caben en un contenedor.
 * @param {Object} container - { lengthCm, widthCm, heightCm, maxWeightKg }
 * @param {Object} box - { lengthCm, widthCm, heightCm, weightKg }
 * @returns {Object} resultado del cálculo
 */
export function calculateVolumetric(container, box) {
  if (!container || !box) return null
  if (box.lengthCm <= 0 || box.widthCm <= 0 || box.heightCm <= 0) return null

  const boxesLength = Math.floor(container.lengthCm / box.lengthCm)
  const boxesWidth = Math.floor(container.widthCm / box.widthCm)
  const boxesHeight = Math.floor(container.heightCm / box.heightCm)

  const totalBoxes = boxesLength * boxesWidth * boxesHeight
  const totalWeight = totalBoxes * box.weightKg
  const isValid = totalWeight <= container.maxWeightKg

  const volumeUsedM3 = (
    (boxesLength * box.lengthCm) *
    (boxesWidth * box.widthCm) *
    (boxesHeight * box.heightCm)
  ) / 1000000

  const containerVolumeM3 = (
    container.lengthCm * container.widthCm * container.heightCm
  ) / 1000000

  const utilizationPct = (volumeUsedM3 / containerVolumeM3) * 100

  return {
    boxesLength,
    boxesWidth,
    boxesHeight,
    totalBoxes,
    totalWeight,
    isValid,
    volumeUsedM3: Math.round(volumeUsedM3 * 100) / 100,
    containerVolumeM3: Math.round(containerVolumeM3 * 100) / 100,
    utilizationPct: Math.round(utilizationPct * 10) / 10,
    weightUtilizationPct: Math.round((totalWeight / container.maxWeightKg) * 1000) / 10,
  }
}
```

---

### Paso 6: Crear componente VolumetricCalc

📄 `src/components/calculadora/VolumetricCalc.js`

```javascript
'use client'

import { useState } from 'react'
import { CONTAINER_TYPES } from '@/lib/constants'
import { calculateVolumetric } from '@/lib/calculadora/volumetric'
import { Box, AlertTriangle, CheckCircle } from 'lucide-react'

export default function VolumetricCalc() {
  const [containerType, setContainerType] = useState('40HC')
  const [box, setBox] = useState({ lengthCm: 0, widthCm: 0, heightCm: 0, weightKg: 0 })

  const container = CONTAINER_TYPES[containerType]
  const result = calculateVolumetric(container, box)

  function handleBoxChange(field, value) {
    setBox(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  return (
    <div className="space-y-6">
      {/* Container Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contenedor</label>
        <div className="flex gap-3">
          {Object.entries(CONTAINER_TYPES).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => setContainerType(key)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                containerType === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Interior: {container.lengthCm}×{container.widthCm}×{container.heightCm} cm — Peso máx: {container.maxWeightKg.toLocaleString('es-AR')} kg
        </p>
      </div>

      {/* Box dimensions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Box className="w-4 h-4" /> Dimensiones de la caja
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Largo (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={box.lengthCm || ''}
              onChange={(e) => handleBoxChange('lengthCm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ancho (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={box.widthCm || ''}
              onChange={(e) => handleBoxChange('widthCm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alto (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={box.heightCm || ''}
              onChange={(e) => handleBoxChange('heightCm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={box.weightKg || ''}
              onChange={(e) => handleBoxChange('weightKg', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {result && result.totalBoxes > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Resultado</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">Distribución</p>
              <p className="text-sm font-medium mt-1">{result.boxesLength} × {result.boxesWidth} × {result.boxesHeight}</p>
              <p className="text-xs text-gray-400">(L × A × H)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">Total de cajas</p>
              <p className="text-2xl font-bold text-blue-700">{result.totalBoxes.toLocaleString('es-AR')}</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-500">Peso total</p>
              <p className={`text-lg font-bold ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {result.totalWeight.toLocaleString('es-AR')} kg
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Volumen utilizado</p>
              <p className="text-sm font-medium">{result.volumeUsedM3} m³ / {result.containerVolumeM3} m³ ({result.utilizationPct}%)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Peso utilizado</p>
              <p className="text-sm font-medium">{result.totalWeight.toLocaleString('es-AR')} / {container.maxWeightKg.toLocaleString('es-AR')} kg ({result.weightUtilizationPct}%)</p>
            </div>
          </div>

          {!result.isValid && (
            <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span>⚠️ El peso total excede el máximo permitido del contenedor.</span>
            </div>
          )}

          {result.isValid && (
            <div className="mt-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span>✅ Configuración válida. Peso dentro del límite.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

### Paso 7: Reemplazar página de calculadora volumétrica

Reemplazar **completamente**:
📄 `src/app/calculadora-volumetrica/page.js`

```javascript
import VolumetricCalc from '@/components/calculadora/VolumetricCalc'

export default function VolumetricaPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Calculadora Volumétrica</h1>
      <p className="text-gray-500 text-sm mb-6">
        Calculá cuántas cajas de un tamaño dado caben en un contenedor.
      </p>
      <VolumetricCalc />
    </div>
  )
}
```

---

### Paso 8: Verificar F3.1

```bash
npm run build
```

**Debe compilar sin errores.**

```bash
git add -A
git commit -m "feat(F3.1): volumetric calculator + exchange rate API proxy" --no-verify
git push origin master
```

**Verificar visualmente**: `npm run dev` → `/calculadora-volumetrica` → Ingresar dimensiones → Ver resultado con cajas, peso, y validación.

---

## F3.2 — Calculadora de Costos (contextual a contenedor)

> ⚠️ Esta calculadora vive en `/contenedores/[id]/costos/`. NO es una página standalone.
> **Prerequisito**: F3.1 completado (necesita ExchangeRateSelector).

---

### Paso 9: Crear migración SQL para cost calculations

📄 `supabase/migrations/004_cost_calculations.sql`

```sql
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
```

**Acción**: Ejecutar en Supabase con MCP `apply_migration`.

---

### Paso 10: Crear defaults de la matriz de costos

📄 `src/lib/calculadora/defaults.js`

```javascript
export const DEFAULT_COST_MATRIX = [
  // Category 1: CIF components (fixed, from inputs)
  { category: '1_cif', name: 'Flete Oceánico', valueType: 'fixed', base: 'input', value: 0, isActive: true, sortOrder: 1 },
  { category: '1_cif', name: 'BAF', valueType: 'fixed', base: 'input', value: 0, isActive: true, sortOrder: 2 },
  { category: '1_cif', name: 'Seguro', valueType: 'fixed', base: 'input', value: 0, isActive: true, sortOrder: 3 },

  // Category 2: Tributes (% of CIF)
  { category: '2_tributos', name: 'Derechos', valueType: 'percentage', base: 'cif', value: 12.6, isActive: true, sortOrder: 10 },
  { category: '2_tributos', name: 'Tasa Estadística', valueType: 'percentage', base: 'cif', value: 3, isActive: true, sortOrder: 11 },

  // Category 3: Taxes (% of Base Imponible)
  { category: '3_impuestos', name: 'IVA', valueType: 'percentage', base: 'base_imponible', value: 21, isActive: true, sortOrder: 20 },
  { category: '3_impuestos', name: 'Percepción IVA', valueType: 'percentage', base: 'base_imponible', value: 20, isActive: true, sortOrder: 21 },
  { category: '3_impuestos', name: 'Percepción Ganancias', valueType: 'percentage', base: 'base_imponible', value: 6, isActive: true, sortOrder: 22 },
  { category: '3_impuestos', name: 'Percepción IIBB', valueType: 'percentage', base: 'base_imponible', value: 3, isActive: true, sortOrder: 23 },

  // Category 4: Operating costs (fixed or %)
  { category: '4_gastos_op', name: 'Costos Agencia', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 30 },
  { category: '4_gastos_op', name: 'IVA s/ Agencia', valueType: 'percentage', base: 'costos_agencia', value: 10.5, isActive: true, sortOrder: 31 },
  { category: '4_gastos_op', name: 'Terminal Portuaria', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 32 },
  { category: '4_gastos_op', name: 'Acarreo GBA', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 33 },
  { category: '4_gastos_op', name: 'Honorarios Despacho', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 34 },
  { category: '4_gastos_op', name: 'Gastos Despacho', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 35 },
  { category: '4_gastos_op', name: 'Gastos Bancarios', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 36 },
  { category: '4_gastos_op', name: 'Gastos Bancarios Ext.', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 37 },
  { category: '4_gastos_op', name: 'Imp. Transf.', valueType: 'percentage', base: 'total_gastos_locales', value: 1.2, isActive: true, sortOrder: 38 },

  // Category 5: External operating costs
  { category: '5_gastos_ext', name: 'Agentes Exterior', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 40 },
  { category: '5_gastos_ext', name: 'Depósito Ext.', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 41 },
  { category: '5_gastos_ext', name: 'Fee', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 42 },
]

export const CATEGORY_LABELS = {
  '1_cif': 'CIF (Costo, Seguro y Flete)',
  '2_tributos': 'Tributos',
  '3_impuestos': 'Impuestos',
  '4_gastos_op': 'Gastos Operativos',
  '5_gastos_ext': 'Gastos Externos',
}
```

---

### Paso 11: Crear engine de cálculo

📄 `src/lib/calculadora/engine.js`

```javascript
/**
 * Motor de cálculo de costos de importación.
 * Función pura: recibe inputs + matrix, devuelve resultados.
 * NO redondear valores intermedios.
 */

export function calculateCosts(inputs, costItems) {
  const { fobTotal } = inputs
  const items = costItems.map(item => ({ ...item }))

  // Step 1: CIF = FOB + sum of active CIF items
  const cifItems = items.filter(i => i.category === '1_cif' && i.isActive)
  cifItems.forEach(item => {
    item.calculatedValue = item.value
  })
  const cif = fobTotal + cifItems.reduce((sum, i) => sum + i.calculatedValue, 0)

  // Step 2: Tributos (% of CIF)
  const tributoItems = items.filter(i => i.category === '2_tributos' && i.isActive)
  tributoItems.forEach(item => {
    item.calculatedValue = cif * (item.value / 100)
  })
  const totalTributos = tributoItems.reduce((sum, i) => sum + i.calculatedValue, 0)

  // Step 3: Base Imponible = CIF + Tributos
  const baseImponible = cif + totalTributos

  // Step 4: Impuestos (% of Base Imponible)
  const impuestoItems = items.filter(i => i.category === '3_impuestos' && i.isActive)
  impuestoItems.forEach(item => {
    item.calculatedValue = baseImponible * (item.value / 100)
  })
  const totalImpuestos = impuestoItems.reduce((sum, i) => sum + i.calculatedValue, 0)

  // Step 5: Gastos Operativos
  const gastosItems = items.filter(i => i.category === '4_gastos_op' && i.isActive)

  // First pass: fixed values and costos_agencia-based
  const costosAgencia = gastosItems.find(i => i.name === 'Costos Agencia')
  gastosItems.forEach(item => {
    if (item.valueType === 'fixed') {
      item.calculatedValue = item.value
    } else if (item.base === 'costos_agencia' && costosAgencia) {
      item.calculatedValue = costosAgencia.value * (item.value / 100)
    }
  })

  // Pre-calculate subtotal for Imp. Transf. base
  const preTransfTotal = gastosItems
    .filter(i => i.name !== 'Imp. Transf.')
    .reduce((sum, i) => sum + (i.calculatedValue ?? 0), 0)

  // Second pass: total_gastos_locales-based (Imp. Transf.)
  gastosItems.forEach(item => {
    if (item.base === 'total_gastos_locales') {
      item.calculatedValue = preTransfTotal * (item.value / 100)
    }
  })

  const totalGastosOp = gastosItems.reduce((sum, i) => sum + (i.calculatedValue ?? 0), 0)

  // Step 6: Gastos Externos
  const gastosExtItems = items.filter(i => i.category === '5_gastos_ext' && i.isActive)
  gastosExtItems.forEach(item => {
    item.calculatedValue = item.value
  })
  const totalGastosExt = gastosExtItems.reduce((sum, i) => sum + i.calculatedValue, 0)

  // Step 7: Total
  const costoTotal = cif + totalTributos + totalImpuestos + totalGastosOp + totalGastosExt

  return {
    fobTotal,
    cif,
    baseImponible,
    totalTributos,
    totalImpuestos,
    totalGastosOp,
    totalGastosExt,
    costoTotal,
    items,
  }
}

/**
 * Genera la versión "cliente" aplicando overrides.
 */
export function applyClientOverrides(result) {
  const clientItems = result.items
    .filter(item => {
      const active = item.clientActive !== null && item.clientActive !== undefined
        ? item.clientActive
        : item.isActive
      return active || item.clientOnly
    })
    .map(item => ({
      ...item,
      displayName: item.clientLabel || item.name,
      displayValue: item.clientValue !== null && item.clientValue !== undefined
        ? item.clientValue
        : item.calculatedValue,
    }))

  return clientItems
}

/**
 * Distribuye costo entre clientes por volumen.
 */
export function distributeByClient(costoTotal, exchangeRate, clients) {
  const totalVolume = clients.reduce((sum, c) => sum + c.volumeM3, 0)
  if (totalVolume === 0) return []

  return clients.map(client => {
    const proportion = client.volumeM3 / totalVolume
    const costUSD = costoTotal * proportion
    const costARS = exchangeRate ? costUSD * exchangeRate : null

    return {
      clientId: client.clientId,
      clientName: client.clientName,
      volumeM3: client.volumeM3,
      proportion: Math.round(proportion * 10000) / 100,
      costUSD: Math.round(costUSD * 100) / 100,
      costARS: costARS ? Math.round(costARS * 100) / 100 : null,
    }
  })
}
```

---

### Paso 12: Crear Server Actions para costos

📄 `src/app/contenedores/[id]/costos/actions.js`

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DEFAULT_COST_MATRIX } from '@/lib/calculadora/defaults'

export async function getOrCreateCalculation(containerId) {
  const supabase = await createClient()

  // Try to get existing
  const { data: existing } = await supabase
    .from('cost_calculations')
    .select('*, cost_items(*)')
    .eq('container_id', containerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing

  // Create new with defaults
  const { data: calc, error: calcError } = await supabase
    .from('cost_calculations')
    .insert({ container_id: containerId })
    .select()
    .single()

  if (calcError) throw new Error(`Error al crear cálculo: ${calcError.message}`)

  // Insert default items
  const defaultItems = DEFAULT_COST_MATRIX.map((item, idx) => ({
    calculation_id: calc.id,
    category: item.category,
    name: item.name,
    value_type: item.valueType,
    base: item.base,
    value: item.value,
    is_active: item.isActive,
    sort_order: item.sortOrder || idx,
  }))

  const { error: itemsError } = await supabase
    .from('cost_items')
    .insert(defaultItems)

  if (itemsError) throw new Error(`Error al crear items: ${itemsError.message}`)

  // Return the full calculation
  const { data: full } = await supabase
    .from('cost_calculations')
    .select('*, cost_items(*)')
    .eq('id', calc.id)
    .single()

  return full
}

export async function updateCostItem(itemId, updates) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cost_items')
    .update(updates)
    .eq('id', itemId)

  if (error) throw new Error(`Error al actualizar: ${error.message}`)
}

export async function updateCalculation(calcId, updates, containerId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cost_calculations')
    .update(updates)
    .eq('id', calcId)

  if (error) throw new Error(`Error al actualizar cálculo: ${error.message}`)
  revalidatePath(`/contenedores/${containerId}/costos`)
}

export async function saveBatchCostItems(items) {
  const supabase = await createClient()

  for (const item of items) {
    const { id, ...updates } = item
    await supabase.from('cost_items').update(updates).eq('id', id)
  }
}
```

---

### Paso 13: Crear componente CostMatrix

📄 `src/components/calculadora/CostMatrix.js`

```javascript
'use client'

import { useState, useCallback } from 'react'
import { calculateCosts } from '@/lib/calculadora/engine'
import { CATEGORY_LABELS } from '@/lib/calculadora/defaults'
import { DollarSign, Eye, EyeOff } from 'lucide-react'

export default function CostMatrix({ calculation, onSave }) {
  const [fob, setFob] = useState(calculation?.fob_total || 0)
  const [items, setItems] = useState(
    (calculation?.cost_items || [])
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(item => ({
        ...item,
        isActive: item.is_active,
        valueType: item.value_type,
      }))
  )

  const result = calculateCosts({ fobTotal: fob }, items)

  const updateItem = useCallback((id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }, [])

  // Group items by category
  const grouped = {}
  items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  return (
    <div className="space-y-6">
      {/* FOB Input */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          FOB Total (USD)
        </label>
        <input
          type="number"
          step="0.01"
          value={fob || ''}
          onChange={(e) => setFob(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-lg font-medium"
          placeholder="0.00"
        />
      </div>

      {/* Cost categories */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="space-y-2">
            {categoryItems.map(item => {
              const calculated = result.items.find(i => i.id === item.id)
              return (
                <div key={item.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${item.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-50'}`}>
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, 'isActive', !item.isActive)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.valueType === 'percentage' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.value || ''}
                          onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.value || ''}
                          onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                      </div>
                    )}
                    <span className="w-28 text-right text-sm font-medium text-gray-800">
                      ${(calculated?.calculatedValue ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Totals */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Resumen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">FOB</span><span className="font-medium">${result.fobTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">CIF</span><span className="font-medium">${result.cif.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Base Imponible</span><span className="font-medium">${result.baseImponible.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tributos</span><span className="font-medium">${result.totalTributos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Impuestos</span><span className="font-medium">${result.totalImpuestos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Gastos Operativos</span><span className="font-medium">${result.totalGastosOp.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Gastos Externos</span><span className="font-medium">${result.totalGastosExt.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
          <hr />
          <div className="flex justify-between text-lg font-bold"><span>COSTO TOTAL</span><span className="text-blue-700">${result.costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
        </div>
      </div>
    </div>
  )
}
```

---

### Paso 14: Crear página de costos del contenedor

📄 `src/app/contenedores/[id]/costos/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getOrCreateCalculation } from './actions'
import CostMatrix from '@/components/calculadora/CostMatrix'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CostosPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: container } = await supabase
    .from('containers')
    .select('id, code, origin_warehouse, container_type')
    .eq('id', id)
    .single()

  if (!container) notFound()

  const calculation = await getOrCreateCalculation(id)

  return (
    <div className="max-w-4xl">
      <Link href={`/contenedores/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver a {container.code}
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Costos — {container.code}</h1>
      <p className="text-gray-500 text-sm mb-6">Calculadora de costos de importación para este contenedor.</p>

      <CostMatrix calculation={calculation} />
    </div>
  )
}
```

---

### Paso 15: Agregar link a costos en la página de detalle del contenedor

En `src/app/contenedores/[id]/page.js`, agregar un botón **después** del botón "Avanzar a:" y **antes** del botón "Eliminar":

```javascript
<Link
  href={`/contenedores/${id}/costos`}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
>
  Calculadora de Costos
</Link>
```

**Importante**: Agregar `import { DollarSign } from 'lucide-react'` al inicio del archivo.

---

### Paso 16: Verificar F3.2

```bash
npm run build
```

**Debe compilar sin errores.**

```bash
git add -A
git commit -m "feat(F3.2): cost calculator engine with matrix and dual output" --no-verify
git push origin master
```

**Verificar visualmente**: `npm run dev` → Abrir un contenedor → Click "Calculadora de Costos" → Ingresar FOB → Ver cálculos actualizarse en tiempo real.

---

## Verificación Final de Phase 3

| Check | Esperado |
|---|---|
| `/calculadora-volumetrica` | Seleccionar tipo, ingresar caja, ver resultado |
| `/api/exchange-rate` | Devuelve JSON con cotizaciones de DolarAPI |
| `/contenedores/[id]/costos` | Muestra matriz con categorías |
| FOB → CIF → Base → Total | Cadena de cálculo correcta |
| Items toggleables | Eye/EyeOff activa/desactiva filas |
| `npm run build` | Sin errores |
