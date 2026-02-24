# F6 — Fixes & Enhancements Phase

Post-F5 fixes organized into logical sub-phases. Each fix has a priority (P1=critical, P2=important, P3=nice-to-have).

> [!IMPORTANT]
> This phase requires install of `exceljs` (for Excel export). All other dependencies are already installed.

---

## Sub-Phase A: Core Functional Fixes (P1)

Fixes that address broken or missing core functionality.

---

### A.1 — Dashboard: Connect to real data

**Priority**: P1

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/page.js)

- Convert from static component to Server Component with Supabase queries
- Show real counts: active containers (by status), clients, containers in transit
- "Próximos Arribos" section fetches containers where `status = 'transito'` ordered by `eta ASC`, show top 5
- Add summary cards: total volume in transit, containers by warehouse

---

### A.2 — Container edit functionality

**Priority**: P1

#### [MODIFY] [actions.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/actions.js)

- Add `updateContainer(id, formData)` server action
- Uses same `containerSchema` but validates partial fields (all optional except origin_warehouse + container_type)
- `revalidatePath` on both list and detail pages after update

#### [NEW] [ContainerEditForm.js](file:///c:/Users/rodri/web/logistica/src/components/contenedores/ContainerEditForm.js)

- Client component (`'use client'`) — reusable form pre-filled with current values
- Fields: ETA, ETD, container_type, origin_warehouse, description, notes
- Code (read-only, displayed but not editable)

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/[id]/page.js)

- Add "Editar" button that toggles edit mode via `?edit=true` searchParam (same pattern as client detail)
- When `edit=true`, show `ContainerEditForm` instead of detail cards

---

### A.3 — Container state reversal

**Priority**: P3

#### [MODIFY] [actions.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/actions.js)

- Add `revertContainerStatus(id, previousStatus)` server action
- No validation on direction — the UI controls which "previous" state is offered

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/[id]/page.js)

- Show a "Retroceder a: {previousLabel}" button (only if `currentIdx > 0`)
- Styled with `bg-gray-100 text-gray-600` to differentiate from the forward action
- Confirmation required (use `window.confirm` via a tiny client component)

---

### A.4 — Container detail: show customers on board

**Priority**: P2

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/[id]/page.js)

- After the info cards and before action buttons, add a "Clientes a bordo" section
- Query: join `packing_list_items` → `clients` through the container's `packing_lists`, group by client, count items + sum volume per client
- Display as a list of client badges with item count and volume

---

### A.5 — Packing List: add/delete rows manually

**Priority**: P1

#### [MODIFY] [actions.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/[id]/packing-list/actions.js)

- Add `addManualItem(containerId, itemData)` server action — creates an item in the packing list (creates packing list if none exists)
- Existing `deletePackingListItem` already exists, but need to update the packing list totals after delete

#### [MODIFY] [ItemClassifier.js](file:///c:/Users/rodri/web/logistica/src/components/packing-list/ItemClassifier.js)

- Add "Agregar fila" button at bottom of the table — shows an inline form row with inputs for name, quantity, weight, dimensions
- Add delete button (trash icon) on each row — calls `deletePackingListItem` with confirmation
- After add/delete, `router.refresh()` to reflect updated data

---

### A.6 — Packing List: Shift+click multi-select

**Priority**: P1

#### [MODIFY] [ItemClassifier.js](file:///c:/Users/rodri/web/logistica/src/components/packing-list/ItemClassifier.js)

- Track `lastSelectedIndex` in state
- On click: if `shiftKey` is held, select all items between `lastSelectedIndex` and clicked index
- On click without shift: single toggle (existing behavior), set `lastSelectedIndex`

---

### A.7 — Packing List: slim down "Nombre" column, wider "Cliente"

**Priority**: P3

#### [MODIFY] [ItemClassifier.js](file:///c:/Users/rodri/web/logistica/src/components/packing-list/ItemClassifier.js)

- Add `max-w-[180px] truncate` to the Nombre `<td>`
- Add `min-w-[120px]` to the Cliente `<th>` and `<td>`
- Add `title={item.name}` for tooltip on truncated names

---

### A.8 — Volumetric calculator: show max boxes by weight

**Priority**: P1

#### [MODIFY] [volumetric.js](file:///c:/Users/rodri/web/logistica/src/lib/calculadora/volumetric.js)

- Add `maxBoxesByWeight` calculation: `Math.floor(container.maxWeightKg / box.weightKg)` (only when `box.weightKg > 0`)
- Return `maxBoxesByWeight` in the result object
- Add `effectiveMaxBoxes: Math.min(totalBoxes, maxBoxesByWeight)` — the real limit considering both volume and weight

#### [MODIFY] [VolumetricCalc.js](file:///c:/Users/rodri/web/logistica/src/components/calculadora/VolumetricCalc.js)

- Add a card showing "Máx. cajas por peso" alongside the existing total
- When weight is the limiting factor (`maxBoxesByWeight < totalBoxes`), highlight this with an orange warning
- Show "Cajas efectivas" card: the minimum between volume and weight limits

---

### A.9 — Cost calculator: save/edit for container

**Priority**: P1

#### [MODIFY] [CostMatrix.js](file:///c:/Users/rodri/web/logistica/src/components/calculadora/CostMatrix.js)

- Add "Guardar" button at the bottom that calls `saveBatchCostItems` (already exists in actions.js) + `updateCalculation` for the FOB value
- Show "Guardado ✓" feedback after save
- Track `isDirty` state — enable save button only when changes are made

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/[id]/costos/page.js)

- Pass `containerId` prop to `CostMatrix` so it can call save actions

---

### A.10 — Cost calculator: default template config

**Priority**: P2

#### [NEW] [cost_template_config table](file:///c:/Users/rodri/web/logistica/supabase/migrations/007_cost_template.sql)

- Create `cost_template_config` table: `id`, `name`, `is_default`, `items JSONB`, `created_at`
- Seed with one default template from `DEFAULT_COST_MATRIX`
- RLS: authenticated users full access

#### [NEW] [page.js](file:///c:/Users/rodri/web/logistica/src/app/calculadora-costos/config/page.js)

- Page to view/edit the default template values (all authenticated users)
- Editable matrix that saves to `cost_template_config`
- **Warning notice on load**: "Epa! Estás editando los valores que aparecen por default para todos los containers nuevos, estás seguro?" — requires explicit confirmation before enabling edits

#### [MODIFY] [actions.js](file:///c:/Users/rodri/web/logistica/src/app/contenedores/[id]/costos/actions.js)

- `getOrCreateCalculation`: when creating new, read from `cost_template_config` (where `is_default = true`) instead of hardcoded `DEFAULT_COST_MATRIX`
- Fallback to `DEFAULT_COST_MATRIX` if no template in DB

---

### A.11 — Cost calculator simulator (standalone)

**Priority**: P3

#### [NEW] [page.js](file:///c:/Users/rodri/web/logistica/src/app/calculadora-costos/page.js)

- Standalone page at `/calculadora-costos` — same `CostMatrix` but without a `containerId`
- Loads defaults from template config (or hardcoded defaults)
- **Save simulations to DB**: new `cost_simulations` table (id, name, fob_total, items JSONB, created_at)
- List saved simulations with ability to load/delete them
- Exportable via ExportButton (type: `simulation`)
- Add nav item to sidebar

#### [ADD TO MIGRATION] [007_cost_template.sql](file:///c:/Users/rodri/web/logistica/supabase/migrations/007_cost_template.sql)

- Add `cost_simulations` table alongside `cost_template_config`

#### [MODIFY] [constants.js](file:///c:/Users/rodri/web/logistica/src/lib/constants.js)

- Add nav item: `{ href: '/calculadora-costos', label: 'Simulador Costos', icon: 'Calculator' }`

---

### A.12 — Tags: show containers where present

**Priority**: P2

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/etiquetas/page.js)

- Expand query to include container info via `item_tags → packing_list_items → packing_lists → containers`
- Display a "Contenedores" column showing badges with container codes

#### [MODIFY] [actions.js](file:///c:/Users/rodri/web/logistica/src/app/etiquetas/actions.js)

- `getTagsWithItemCount`: expand to also return distinct container codes for each tag

---

## Sub-Phase B: Export to Excel (P1)

Universal Excel export via `exceljs`. This is a cross-cutting feature.

---

### B.1 — Install exceljs + create export utility

**Priority**: P1

```bash
npm install exceljs
```

#### [NEW] [excelExport.js](file:///c:/Users/rodri/web/logistica/src/lib/excel/excelExport.js)

- Utility with factory functions for each exportable view:
  - `exportDashboard(data)` — summary stats
  - `exportContainerList(containers)` — container board
  - `exportContainerDetail(container, items, costs)` — container detail + packing list + costs
  - `exportPackingList(items)` — packing list with client + tags
  - `exportCostCalculation(calculation, items)` — full cost matrix
  - `exportClients(clients)` — client board
  - `exportTags(tags)` — tags with item counts
  - `exportVolumetric(result)` — calculator results
  - `exportHistorico(containers)` — historical data
- Each function returns an `ExcelJS.Workbook` buffer
- Format: styled headers (dark bg, white text, bold), auto-column-width, number formatting for currency
- **Multi-sheet** for `container-detail`: Sheet 1 = Container info, Sheet 2 = Packing List, Sheet 3 = Costs
- **Single-sheet** for all other export types (packing-list, costs, clients, tags, etc.)

#### [NEW] [route.js](file:///c:/Users/rodri/web/logistica/src/app/api/export/route.js)

- API route: `GET /api/export?type=...&id=...`
- Supported types: `dashboard`, `containers`, `container-detail`, `packing-list`, `costs`, `clients`, `tags`, `volumetric`, `historico`, `simulation`
- Fetches data from Supabase, generates Excel, returns as download

### B.2 — Create reusable ExportButton component

#### [NEW] [ExportButton.js](file:///c:/Users/rodri/web/logistica/src/components/ui/ExportButton.js)

- Client component with lucide `Download` icon
- Props: `exportType`, `exportId` (optional), `label` (default: "Exportar Excel")
- On click: fetches `/api/export?type=...&id=...`, triggers download
- Loading state with spinner

### B.3 — Add ExportButton to all views

Modify the following pages to add `<ExportButton>`:

| Page | Export Type |
|---|---|
| `/` (Dashboard) | `dashboard` |
| `/contenedores` | `containers` |
| `/contenedores/[id]` | `container-detail` |
| `/contenedores/[id]/packing-list` | `packing-list` |
| `/contenedores/[id]/costos` | `costs` |
| `/clientes` | `clients` |
| `/etiquetas` | `tags` |
| `/calculadora-volumetrica` | `volumetric` |
| `/historico` | `historico` |

---

## Sub-Phase C: Histórico (P1)

### C.1 — Connect histórico page

**Priority**: P1

#### [MODIFY] [page.js](file:///c:/Users/rodri/web/logistica/src/app/historico/page.js)

- Replace placeholder with real Server Component
- Query: `containers` where `status = 'finalizado'`, ordered by `eta DESC`
- Show filterable table: code, origin, type, ETD, ETA, description
- Include summary stats at top

---

## Execution Order

The plan should be executed in this order to respect dependencies:

1. **A.2** — Container edit (unblocks A.3, A.4)
2. **A.3** — Container state reversal
3. **A.4** — Container detail: customers on board
4. **A.1** — Dashboard: connect data
5. **C.1** — Histórico: connect data
6. **A.5** — Packing list: add/delete rows
7. **A.6** — Packing list: shift+click
8. **A.7** — Packing list: column widths
9. **A.8** — Volumetric: max boxes by weight
10. **A.9** — Cost calculator: save/edit
11. **A.10** — Cost calculator: template config
12. **A.11** — Cost calculator: simulator
13. **A.12** — Tags: show containers
14. **B.1** — Export utility + API route (install `exceljs`)
15. **B.2** — ExportButton component
16. **B.3** — Add ExportButton to all views

---

## Verification Plan

### Automated
```bash
npm run build
```

### Manual Verification (by user on dev server)

1. **Dashboard**: Go to `/` — verify real counts, próximos arribos section
2. **Container edit**: Go to a container detail → "Editar" → change ETA → verify it saved
3. **Container revert**: Go to a container in "transito" → "Retroceder a: Depósito" → confirm → verify state changed
4. **Customers on board**: On container detail page, verify "Clientes a bordo" section shows clients that have items in the packing list
5. **Packing list add/delete**: Go to a packing list → "Agregar fila" → fill in → verify row appears; delete a row → confirm → verify row removed
6. **Shift+click**: Select item 1, then shift+click item 5 → verify items 1-5 are selected
7. **Column widths**: Visually confirm "Nombre" is shorter and "Cliente" has more room
8. **Volumetric max boxes**: Enter box dimensions + weight → verify "Máx. cajas por peso" card appears and shows correct count
9. **Cost calculator save**: Change FOB + some values → click "Guardar" → refresh page → verify values persist
10. **Template config**: Go to config page → change a default % → create a new container → verify new calculation uses updated defaults
11. **Simulator**: Go to `/calculadora-costos` → enter FOB and verify calculations work without a container
12. **Tags containers**: Go to `/etiquetas` → verify container codes column shows which containers use each tag
13. **Export**: Click "Exportar Excel" on every page listed → verify `.xlsx` downloads and opens correctly.
14. **Histórico**: Go to `/historico` → verify finalized containers are listed with correct data
