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
