# F7 — Phase 2 Fixes: Excel Exports, Cost Simulator & Template Config

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Skills a leer antes**:
- `.agents/skills/excel-handling/SKILL.md`
- `.agents/skills/supabase-patterns/SKILL.md`

**Prerequisito**: Migration `007_cost_template.sql` aplicada manualmente en Supabase SQL Editor ✅

---

## Paso 1: Reescribir `excelExport.js` — Motor de exportación profesional

📄 `src/lib/utils/excelExport.js`

**Borrar todo el contenido actual** y reemplazar con:

```javascript
import ExcelJS from 'exceljs'
import { CATEGORY_LABELS } from '@/lib/calculadora/defaults'

// ── Styling helper ──────────────────────────────────────────────
function applySheetStyling(sheet, { hasTotals = false } = {}) {
    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 28

    // Borders + alternating rows for data
    const lastRow = sheet.rowCount
    const lastCol = sheet.columnCount

    for (let r = 2; r <= lastRow; r++) {
        const row = sheet.getRow(r)
        const isAlt = r % 2 === 0
        const isTotalRow = hasTotals && r === lastRow

        for (let c = 1; c <= lastCol; c++) {
            const cell = row.getCell(c)
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            }

            if (isTotalRow) {
                cell.font = { bold: true, size: 11 }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
            } else if (isAlt) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
            }
        }
    }

    // Freeze header
    sheet.views = [{ state: 'frozen', ySplit: 1 }]

    // AutoFilter
    if (lastRow > 1) {
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: lastCol }
        }
    }
}

function currencyFmt(cell) {
    cell.numFmt = '#,##0.00'
    cell.alignment = { horizontal: 'right' }
}

// ── Container list ──────────────────────────────────────────────
function buildContainerList(workbook, data) {
    const sheet = workbook.addWorksheet('Contenedores')

    const STATUS_MAP = {
        deposito: 'En Depósito',
        transito: 'En Tránsito',
        aduana: 'En Aduana',
        finalizado: 'Finalizado',
    }
    const ORIGIN_MAP = { HK: 'Hong Kong 🇭🇰', CH: 'China 🇨🇳', USA: 'Estados Unidos 🇺🇸' }

    sheet.columns = [
        { header: 'Código', key: 'code', width: 18 },
        { header: 'Estado', key: 'status', width: 16 },
        { header: 'Origen', key: 'origin', width: 22 },
        { header: 'Tipo', key: 'type', width: 10 },
        { header: 'ETD', key: 'etd', width: 14 },
        { header: 'ETA', key: 'eta', width: 14 },
        { header: 'Descripción', key: 'description', width: 35 },
    ]

    data.forEach(c => {
        sheet.addRow({
            code: c.code,
            status: STATUS_MAP[c.status] || c.status,
            origin: ORIGIN_MAP[c.origin_warehouse] || c.origin_warehouse,
            type: c.container_type ? `${c.container_type}'` : '—',
            etd: c.etd ? new Date(c.etd).toLocaleDateString('es-AR') : '—',
            eta: c.eta ? new Date(c.eta).toLocaleDateString('es-AR') : '—',
            description: c.description || '',
        })
    })

    // Totals
    sheet.addRow({ code: `Total: ${data.length} contenedores` })

    applySheetStyling(sheet, { hasTotals: true })
    return sheet
}

// ── Packing list ────────────────────────────────────────────────
function buildPackingList(workbook, items, sheetName = 'Packing List') {
    const sheet = workbook.addWorksheet(sheetName)

    sheet.columns = [
        { header: '#', key: 'idx', width: 6 },
        { header: 'Nombre', key: 'name', width: 35 },
        { header: 'Cantidad', key: 'quantity', width: 12 },
        { header: 'Peso (Kg)', key: 'weight_kg', width: 13 },
        { header: 'Volumen (m³)', key: 'volume_m3', width: 15 },
        { header: 'Cliente', key: 'client', width: 22 },
        { header: 'Etiquetas', key: 'tags', width: 28 },
    ]

    items.forEach((item, idx) => {
        // Extract tags — handle nested item_tags structure
        let tagStr = '—'
        if (item.item_tags && Array.isArray(item.item_tags)) {
            const names = item.item_tags
                .map(it => it.tags?.name)
                .filter(Boolean)
            tagStr = names.length > 0 ? names.join(', ') : '—'
        }

        const row = sheet.addRow({
            idx: idx + 1,
            name: item.name || '—',
            quantity: item.quantity || 0,
            weight_kg: parseFloat(item.weight_kg) || 0,
            volume_m3: parseFloat(item.volume_m3) || 0,
            client: item.clients?.name || '—',
            tags: tagStr,
        })

        currencyFmt(row.getCell('weight_kg'))
        currencyFmt(row.getCell('volume_m3'))
    })

    // Totals row
    const dataRows = items.length
    const totalsRow = sheet.addRow({
        idx: '',
        name: 'TOTALES',
        quantity: items.reduce((s, i) => s + (i.quantity || 0), 0),
        weight_kg: items.reduce((s, i) => s + (parseFloat(i.weight_kg) || 0), 0),
        volume_m3: items.reduce((s, i) => s + (parseFloat(i.volume_m3) || 0), 0),
        client: `${new Set(items.map(i => i.clients?.name).filter(Boolean)).size} clientes`,
        tags: `${new Set(items.flatMap(i => (i.item_tags || []).map(t => t.tags?.name)).filter(Boolean)).size} etiquetas`,
    })

    currencyFmt(totalsRow.getCell('weight_kg'))
    currencyFmt(totalsRow.getCell('volume_m3'))

    applySheetStyling(sheet, { hasTotals: true })
    return sheet
}

// ── Costs sheet ─────────────────────────────────────────────────
function buildCostsSheet(workbook, costs, sheetName = 'Costos') {
    const sheet = workbook.addWorksheet(sheetName)

    sheet.columns = [
        { header: 'Categoría', key: 'category', width: 28 },
        { header: 'Concepto', key: 'name', width: 30 },
        { header: 'Valor Config.', key: 'value', width: 16 },
        { header: 'Tipo', key: 'type', width: 14 },
        { header: 'Activo', key: 'active', width: 10 },
    ]

    costs.forEach(item => {
        const row = sheet.addRow({
            category: CATEGORY_LABELS[item.category] || item.category,
            name: item.name,
            value: item.value || 0,
            type: item.value_type === 'percentage' ? 'Porcentaje (%)' : 'Fijo (USD)',
            active: item.is_active ? 'Sí' : 'No',
        })
        currencyFmt(row.getCell('value'))
    })

    applySheetStyling(sheet)
    return sheet
}

// ── Container info sheet ────────────────────────────────────────
function buildContainerInfo(workbook, container) {
    const ORIGIN_MAP = { HK: 'Hong Kong', CH: 'China', USA: 'Estados Unidos' }

    const sheet = workbook.addWorksheet('Información')
    sheet.columns = [
        { header: 'Campo', key: 'field', width: 22 },
        { header: 'Valor', key: 'value', width: 45 },
    ]

    const rows = [
        { field: 'Código', value: container.code },
        { field: 'Estado', value: container.status },
        { field: 'Origen', value: ORIGIN_MAP[container.origin_warehouse] || container.origin_warehouse },
        { field: 'Tipo', value: container.container_type ? `${container.container_type}'` : '—' },
        { field: 'ETD', value: container.etd ? new Date(container.etd).toLocaleDateString('es-AR') : '—' },
        { field: 'ETA', value: container.eta ? new Date(container.eta).toLocaleDateString('es-AR') : '—' },
        { field: 'Descripción', value: container.description || '—' },
        { field: 'Notas', value: container.notes || '—' },
    ]

    rows.forEach(r => sheet.addRow(r))
    applySheetStyling(sheet)

    // Make "Campo" column bold
    for (let r = 2; r <= sheet.rowCount; r++) {
        sheet.getRow(r).getCell(1).font = { bold: true }
    }

    return sheet
}

// ── Simulations ────────────────────────────────────────────────
function buildSimulations(workbook, data) {
    const sheet = workbook.addWorksheet('Simulaciones')

    sheet.columns = [
        { header: 'Nombre', key: 'name', width: 35 },
        { header: 'FOB (USD)', key: 'fob_total', width: 16 },
        { header: 'Fecha', key: 'created_at', width: 18 },
    ]

    data.forEach(sim => {
        const row = sheet.addRow({
            name: sim.name,
            fob_total: sim.fob_total || 0,
            created_at: new Date(sim.created_at).toLocaleDateString('es-AR'),
        })
        currencyFmt(row.getCell('fob_total'))
    })

    applySheetStyling(sheet)
    return sheet
}

// ══════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════

export async function generateExcel(type, data, filename = 'export') {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Logística Internacional'
    workbook.created = new Date()

    if (type === 'containers') {
        buildContainerList(workbook, data)
    }
    else if (type === 'packing_list') {
        buildPackingList(workbook, data)
    }
    else if (type === 'container_full') {
        buildContainerInfo(workbook, data.container)
        buildPackingList(workbook, data.items)
        if (data.costs && data.costs.length > 0) {
            buildCostsSheet(workbook, data.costs)
        }
    }
    else if (type === 'simulations') {
        buildSimulations(workbook, data)
    }
    else {
        // Generic fallback
        const sheet = workbook.addWorksheet(filename)
        if (Array.isArray(data) && data.length > 0) {
            sheet.columns = Object.keys(data[0]).map(k => ({ header: k, key: k, width: 18 }))
            data.forEach(row => sheet.addRow(row))
            applySheetStyling(sheet)
        }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
}
```

**Cambios clave vs. versión anterior**:
1. **BUG FIX**: Los costos se escribían en `itemsSheet` en vez de `costsSheet` (línea 63 vieja)
2. **Tags**: La columna "Etiquetas" ahora existe en Packing List, extrayendo de `item.item_tags[].tags.name`
3. **Totales**: Cada sheet tipo tabla tiene una fila TOTALES al final
4. **Estilo profesional**: header oscuro con texto blanco, filas alternadas, bordes, freeze panes, autoFilter, formato numérico para moneda
5. **Container Info**: Sheet dedicada con campo/valor en formato legible
6. **Categorías legibles**: Los costos muestran el label ("CIF (Costo, Seguro y Flete)") en vez del slug ("1_cif")

**Verificar**: `npm run build` debe compilar sin errores.

---

## Paso 2: Agregar `item_tags` a la query del container detail

📄 `src/app/contenedores/[id]/page.js`

**Buscar** (aprox línea 30-37):

```javascript
    const { data: items } = await supabase
        .from('packing_list_items')
        .select(`
            id, name, quantity, weight_kg, volume_m3, client_id, 
            clients(name), 
            packing_lists!inner(container_id)
        `)
        .eq('packing_lists.container_id', id)
```

**Reemplazar con**:

```javascript
    const { data: items } = await supabase
        .from('packing_list_items')
        .select(`
            id, name, quantity, weight_kg, volume_m3, client_id, 
            clients(name), 
            packing_lists!inner(container_id),
            item_tags(tags(name))
        `)
        .eq('packing_lists.container_id', id)
```

**Cambio**: Se agregó `item_tags(tags(name))` al SELECT para que las etiquetas del item viajen hasta el `fullExportData` que se pasa al `ExportButton`.

**Verificar**: La página de detalle del contenedor debe seguir cargando sin errores.

---

## Paso 3: Agregar `item_tags` a la query del packing list detail

📄 `src/app/contenedores/[id]/packing-list/actions.js`

**Buscar** la función `getPackingList`:

```javascript
export async function getPackingList(containerId) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('packing_lists')
        .select('*, packing_list_items(*)')
        .eq('container_id', containerId)
        .single()

    return data
}
```

**Reemplazar con**:

```javascript
export async function getPackingList(containerId) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('packing_lists')
        .select(`
            *,
            packing_list_items(
                *,
                clients(name),
                item_tags(tags(name))
            )
        `)
        .eq('container_id', containerId)
        .single()

    return data
}
```

**Cambio**: Se expandió el SELECT para incluir `clients(name)` e `item_tags(tags(name))` en los items del packing list. Esto permite que el `ExportButton` en la página del packing list tenga acceso a tags y clientes.

---

## Paso 4: Agregar link a configuración de plantilla desde el Simulador

📄 `src/components/calculadora/Simulator.js`

**Buscar** (aprox línea 6-7):

```javascript
import { Calculator, Save, History, Trash2, FileSpreadsheet, Loader2 } from 'lucide-react'
import ExportButton from '@/components/ui/ExportButton'
```

**Reemplazar con**:

```javascript
import { Calculator, Save, History, Trash2, FileSpreadsheet, Loader2, Settings } from 'lucide-react'
import ExportButton from '@/components/ui/ExportButton'
import Link from 'next/link'
```

**Después, buscar** (aprox línea 12-13):

```javascript
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                Simulador Standalone de Costos
            </h1>
```

> **NOTA**: Este bloque está en `src/app/calculadora-costos/page.js`, NO en `Simulator.js`. El Simulator.js no tiene título. Hay que editar **`page.js`** del simulador.

📄 `src/app/calculadora-costos/page.js`

**Buscar**:

```javascript
import { Calculator } from 'lucide-react'
```

**Reemplazar con**:

```javascript
import { Calculator, Settings } from 'lucide-react'
import Link from 'next/link'
```

**Después, buscar** (aprox línea 11-15):

```javascript
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                Simulador Standalone de Costos
            </h1>
            <p className="text-gray-500 text-sm max-w-2xl">
                Utiliza esta herramienta para simular costos de importación sin vincularlos a un contenedor específico.
                Tus simulaciones se guardarán localmente en la base de datos para referencia futura.
            </p>
```

**Reemplazar con**:

```javascript
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    Simulador de Costos
                </h1>
                <Link
                    href="/calculadora-costos/config"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    <Settings className="w-4 h-4" />
                    Configurar Plantilla
                </Link>
            </div>
            <p className="text-gray-500 text-sm max-w-2xl">
                Simula costos de importación sin vincularlos a un contenedor.
                Las simulaciones se guardan para referencia futura.
                Usá <strong>Configurar Plantilla</strong> para definir los valores por defecto.
            </p>
```

**Verificar**: Ir a `/calculadora-costos` → debe verse el botón "Configurar Plantilla" arriba a la derecha → al clickear navega a la config page.

---

## Paso 5: Verificar que el Simulador puede guardar (DB OK)

**Acción manual**: Ir a `/calculadora-costos` en el navegador.

1. Ingresar un nombre ("Test Simulación")
2. Cambiar el FOB a 10000
3. Click en el botón "Guardar Cambios" (botón flotante azul que aparece al modificar valores)
4. Verificar que la simulación aparece en el sidebar derecho "Simulaciones Guardadas"
5. Si aparece un error `Could not find the table 'public.cost_simulations'`, la migración NO fue aplicada. Volver a ejecutar `007_cost_template.sql` en Supabase.

---

## Paso 6: Build final

```bash
npm run build
```

**Debe compilar sin errores.**

---

## Verificación Final

| # | Check | Cómo verificar |
|---|-------|----------------|
| 1 | Simulator save | `/calculadora-costos` → FOB + nombre → guardar → debe aparecer en sidebar |
| 2 | Container full export | `/contenedores/[id]` → "Exportar Excel" → abrir `.xlsx` → 3 sheets: Info, Packing List, Costos |
| 3 | Costos en sheet correcto | En el .xlsx del paso 2, verificar que la pestaña "Costos" tiene datos (antes estaba vacía) |
| 4 | Tags en export | En el .xlsx del paso 2, verificar columna "Etiquetas" en Packing List (muestra tags o "—") |
| 5 | Totales en export | En el .xlsx del paso 2, verificar fila TOTALES al final del Packing List |
| 6 | Formato profesional | Headers oscuros, filas alternadas, bordes, freeze panes |
| 7 | Container list export | `/contenedores` → "Exportar Excel" → verificar formato profesional |
| 8 | Config link | `/calculadora-costos` → "Configurar Plantilla" → navega a config page |
| 9 | Config saves | En config page → cambiar un % → Guardar → refrescar → valor persiste |
| 10 | `npm run build` | Sin errores |
