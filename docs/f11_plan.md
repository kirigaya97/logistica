# Exchange Rate Selector — Redesign & Calculator Integration (F11)

This plan redesigns the `ExchangeRateSelector` component from a card-grid into a compact dropdown, adds a **"Personalizado"** option with a manual input, and wires it into every active calculator appearance so costs are always shown with an ARS conversion.

> [!NOTE]
> `ExchangeRateSelector.js` and `useExchangeRate.js` already exist and the API route (`/api/exchange-rate`) proxies DolarAPI correctly. The component was never wired to any view. This plan activates it everywhere.

> [!NOTE]
> **No database migration required.** The `snapshot` field in the `cost_calculations` table is JSONB — new exchange rate keys can be added to existing save calls without a schema change.

---

## Context: current data shape

`GET /api/exchange-rate` returns an array from DolarAPI:
```json
[
  { "casa": "oficial",          "nombre": "Oficial",                   "compra": 1060, "venta": 1068 },
  { "casa": "blue",             "nombre": "Blue",                      "compra": 1300, "venta": 1320 },
  { "casa": "bolsa",            "nombre": "Bolsa",                     "compra": 1280, "venta": 1285 },
  { "casa": "contadoconliqui",  "nombre": "Contado con Liquidación",   "compra": 1290, "venta": 1295 }
]
```

The **`venta`** (sell) value is used for all conversions — it is the conservative rate for import cost projections.

---

## Proposed Changes

### Shared Component

#### [MODIFY] `src/components/calculadora/ExchangeRateSelector.js`

Full redesign. The current card-grid layout is replaced with a single `<select>` + a conditional manual input.

**New props interface:**
```js
// value: { type: string, rate: number } | null
// onChange: (value: { type: string, rate: number } | null) => void
ExchangeRateSelector({ value, onChange })
```

- While loading: render a disabled `<select>` with a single placeholder option ("Cargando cotizaciones…").
- On error: render a disabled `<select>` with a single option ("Error al cargar") and an inline error message.
- Once loaded, populate the `<select>` with one `<option>` per rate from the API:
  - `value` attribute: `rate.casa` (e.g. `"blue"`)
  - Display text: `{rate.nombre} — $ {rate.venta.toLocaleString('es-AR')} venta`
  - Final `<option value="custom">` — `Personalizado`
- When user picks an API rate: call `onChange({ type: rate.casa, rate: rate.venta })`.
- When user picks `"custom"`: show a `<input type="number">` for manual entry. Call `onChange({ type: 'custom', rate: parseFloat(input) || 0 })` on change.
- Add a "sin tipo de cambio" neutral `<option value="">` at the top so the user can deselect. When selected, call `onChange(null)`.
- Remove the old `RATE_LABELS` map — names come directly from `rate.nombre`.

---

### Cost Matrix

#### [MODIFY] `src/components/calculadora/CostMatrix.js`

This is the single change that propagates to all three calculator appearances.

- Add state: `const [selectedRate, setSelectedRate] = useState(null)` — shape `{ type, rate } | null`.
- Import and render `<ExchangeRateSelector value={selectedRate} onChange={setSelectedRate} />` as a new section **above** the FOB input, inside its own `bg-white rounded-xl p-6` card, titled "Tipo de Cambio".
  - When `readOnly={true}`, still render the selector (read-only mode benefits from ARS conversion display too), but keep it fully interactive — the user is just browsing a historical simulation and may want to convert values to today's ARS.
- In the **Resumen** section, when `selectedRate` is not null, add an ARS conversion block **below** the existing `COSTO TOTAL` row:
  ```
  ─────────────────────────────────────
  COSTO TOTAL ARS   $ {(costoTotal * selectedRate.rate).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
  (at {selectedRate.type === 'custom' ? 'tasa personalizada' : selectedRate.type} — $ {selectedRate.rate.toLocaleString('es-AR')} / USD)
  ```
  Style it distinctly (e.g. `text-green-700 bg-green-50` card) so it is clearly secondary to the USD total.
- Update `handleSave` to pass `exchangeRate: selectedRate` alongside the existing data:
  ```js
  await onSave({ fobTotal: fob, items, result, exchangeRate: selectedRate })
  ```

---

### Simulation Persistence

#### [MODIFY] `src/components/calculadora/Simulator.js`

- Update `handleSave` to destructure `exchangeRate` from the callback argument.
- Enrich the `snapshot` object with exchange rate data:
  ```js
  const snapshot = {
      ...
      exchangeRateType:  exchangeRate?.type  ?? null,
      exchangeRateValue: exchangeRate?.rate  ?? null,
      costoTotalARS: exchangeRate ? Math.round(result.costoTotal * exchangeRate.rate) : null,
  }
  ```
  No action or DB change is needed — `snapshot` is already a JSONB column.

---

### Simulation Detail View

#### [MODIFY] `src/app/calculadora-costos/[id]/page.js`

- In the "Información de la Simulación" sidebar, add a block to display the saved exchange rate when present in `snapshot`:
  ```
  Tipo de Cambio
  Blue — $ 1.320 / USD

  Costo Total ARS
  $ 9.850.000
  ```
  Render this block only when `snapshot.exchangeRateValue` is not null. Use `snapshot.exchangeRateType` for the label and `snapshot.costoTotalARS` for the ARS figure.

---

## What does NOT change

| File | Reason |
|---|---|
| `src/app/api/exchange-rate/route.js` | Already correct — proxies DolarAPI and caches 5 min |
| `src/hooks/useExchangeRate.js` | Already correct — used inside `ExchangeRateSelector` |
| `src/lib/calculadora/engine.js` | Stays USD-only; ARS is display-only, no engine change needed |
| `src/app/contenedores/[id]/costos/page.js` | Gets the selector automatically through `CostMatrix` |
| `src/app/calculadora-costos/page.js` | Gets the selector via `Simulator → CostMatrix` |
| `src/app/calculadora-volumetrica/` | No monetary conversion — purely volumetric |

---

## Verification Plan

### Automated
- `npm run build` — no type or lint errors.

### Manual / Browser

1. **Dropdown loads correctly**: Open `/calculadora-costos`. The new "Tipo de Cambio" card should appear above the FOB input, with a populated dropdown listing all DolarAPI rates and a "Personalizado" option.
2. **API rate conversion**: Select "Blue". Enter a FOB value (e.g. USD 10,000). Confirm the ARS block appears in the summary showing `costoTotal × rate.venta`.
3. **Custom rate**: Select "Personalizado". Enter `1500` manually. Confirm the ARS total updates reactively.
4. **Deselect rate**: Choose the blank/empty option. Confirm the ARS block disappears.
5. **Simulation save with rate**: In the simulator, select "Oficial", enter a FOB, and save. Open the saved simulation's detail page (`/calculadora-costos/[id]`). Confirm the sidebar shows the saved rate type, value, and ARS total.
6. **Simulation saved without rate**: Save a simulation with no rate selected. Confirm the detail page sidebar does not show the exchange rate block (graceful null handling).
7. **Container costos view**: Open `/contenedores/[id]/costos`. Confirm the same selector appears and ARS conversion works. No save/persist change needed here.
