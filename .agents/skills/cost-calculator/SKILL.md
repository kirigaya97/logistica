---
name: cost-calculator
description: Business logic for the import cost calculator - formulas, matrix structure, dual output
---

# Cost Calculator

## Matrix Structure

Costs are organized in categories, each with a calculation base:

```
FOB (input)
 └── + Flete + BAF + Seguro = CIF
      └── + Derechos + Tasa Estadística = Base Imponible
           └── + IVA + Percepciones = Subtotal Impuestos
                └── + Gastos Operativos = COSTO TOTAL
```

## Formulas

```
CIF = FOB + Flete Oceánico + BAF + Seguro

Base Imponible = CIF + (CIF × Derechos%) + (CIF × Tasa Estadística%)

Impuestos = Base Imponible × (IVA% + Perc.IVA% + Perc.Ganancias% + Perc.IIBB%)

Total Gastos Locales = Σ(todos los gastos operativos fijos y porcentuales)
  - IVA s/Agencia se calcula: Costos Agencia × 10.5%
  - Imp.Transf se calcula: Total Gastos Locales × 1.2%

COSTO TOTAL = CIF + Tributos + Impuestos + Total Gastos Locales

Costo por Cliente = (Volumen Cliente / Volumen Total Container) × Costo Total
```

## Default Concepts

```javascript
// src/lib/calculadora/defaults.js
export const DEFAULT_COST_MATRIX = [
  // Category 1: CIF components (fixed, from inputs)
  { category: '1_cif', name: 'Flete Oceánico', valueType: 'fixed', base: 'input', value: 0, isActive: true },
  { category: '1_cif', name: 'BAF', valueType: 'fixed', base: 'input', value: 0, isActive: true },
  { category: '1_cif', name: 'Seguro', valueType: 'fixed', base: 'input', value: 0, isActive: true },

  // Category 2: Tributes (% of CIF)
  { category: '2_tributos', name: 'Derechos', valueType: 'percentage', base: 'cif', value: 12.6, isActive: true },
  { category: '2_tributos', name: 'Tasa Estadística', valueType: 'percentage', base: 'cif', value: 3, isActive: true },

  // Category 3: Taxes (% of Base Imponible)
  { category: '3_impuestos', name: 'IVA', valueType: 'percentage', base: 'base_imponible', value: 21, isActive: true },
  { category: '3_impuestos', name: 'Percepción IVA', valueType: 'percentage', base: 'base_imponible', value: 20, isActive: true },
  { category: '3_impuestos', name: 'Percepción Ganancias', valueType: 'percentage', base: 'base_imponible', value: 6, isActive: true },
  { category: '3_impuestos', name: 'Percepción IIBB', valueType: 'percentage', base: 'base_imponible', value: 3, isActive: true },

  // Category 4: Operating costs (fixed or %)
  { category: '4_gastos_op', name: 'Costos Agencia', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'IVA s/ Agencia', valueType: 'percentage', base: 'costos_agencia', value: 10.5, isActive: true },
  { category: '4_gastos_op', name: 'Terminal Portuaria', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'Acarreo GBA', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'Honorarios Despacho', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'Gastos Despacho', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'Gastos Bancarios', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'Gastos Bancarios Ext.', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '4_gastos_op', name: 'Imp. Transf.', valueType: 'percentage', base: 'total_gastos_locales', value: 1.2, isActive: true },

  // Category 5: External operating costs
  { category: '5_gastos_ext', name: 'Agentes Exterior', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '5_gastos_ext', name: 'Depósito Ext.', valueType: 'fixed', base: null, value: 0, isActive: true },
  { category: '5_gastos_ext', name: 'Fee', valueType: 'fixed', base: null, value: 0, isActive: true },
]
```

## Dual Output Logic

### Real Output
- Calculated from actual values
- Read-only display
- Source of truth

### Client Output
- Copy of real output with override capability per row
- Each row can independently have:
  - `client_value` — different amount (null = use real)
  - `client_active` — hidden from client (null = use isActive)
  - `client_label` — different label (null = use name)
- User can also ADD rows that only exist in client output

## Engine Interface
```javascript
// src/lib/calculadora/engine.js
export function calculateCosts(inputs, costItems) {
  // inputs: { fobTotal, oceanFreight, baf, insurance, exchangeRate }
  // costItems: array of cost item objects
  // Returns: { cif, baseImponible, totalTributos, totalImpuestos, totalGastosLocales, costoTotal, items: [...with calculatedValue] }
}

export function distributeByClient(costoTotal, clients) {
  // clients: [{ clientId, volumeM3 }]
  // Returns: [{ clientId, proportion, costUSD, costARS }]
}
```

## DO NOT
- Do NOT calculate costs in the React component — use engine.js
- Do NOT round intermediate values — only round final display
- Do NOT hardcode percentages in the engine — read from the matrix
