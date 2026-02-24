import * as XLSX from 'xlsx'

/**
 * Parsea un archivo Excel y retorna las primeras filas + headers detectados.
 */
export function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 })

                // Filter out completely empty rows
                const data = rawData.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))

                if (data.length < 2) {
                    reject(new Error('El archivo debe tener al menos un header y una fila de datos'))
                    return
                }

                const headers = data[0].map(h => String(h || '').trim())
                const rows = data.slice(1)

                resolve({ headers, rows, totalRows: rows.length })
            } catch (err) {
                reject(new Error('Error al parsear el archivo Excel'))
            }
        }
        reader.onerror = () => reject(new Error('Error al leer el archivo'))
        reader.readAsArrayBuffer(file)
    })
}

/**
 * Auto-detecta mapeo de columnas basado en nombres de headers.
 */
const FIELD_PATTERNS = {
    name: ['nombre', 'descripcion', 'description', 'item', 'producto', 'product', 'articulo'],
    quantity: ['cantidad', 'qty', 'quantity', 'cant', 'unidades', 'units', 'pcs'],
    weight_kg: ['peso', 'weight', 'kg', 'peso_kg', 'weight_kg', 'gross'],
    height_cm: ['alto', 'height', 'h', 'altura'],
    width_cm: ['ancho', 'width', 'w'],
    depth_cm: ['profundidad', 'depth', 'largo', 'length', 'l', 'fondo'],
    volume_m3: ['volumen', 'volume', 'vol', 'cbm', 'm3', 'vol_m3'],
}

export function autoDetectMapping(headers) {
    const mapping = {}

    headers.forEach((header, index) => {
        const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '')
        for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
            if (mapping[field] !== undefined) continue // already matched
            if (patterns.some(p => normalized.includes(p))) {
                mapping[field] = index
            }
        }
    })

    return mapping
}
