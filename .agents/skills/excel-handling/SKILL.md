---
name: excel-handling
description: Patterns for parsing Excel packing lists (SheetJS) and generating export files (ExcelJS)
---

# Excel Handling

## Parsing Packing Lists (Client-Side, SheetJS)

### Installation
```bash
npm install xlsx
```

### Basic Parse
```javascript
import * as XLSX from 'xlsx'

function parsePacking(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) // Array of arrays
      resolve(data)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
```

### Column Mapping
The packing list fields we expect:
| Field | DB Column | Type |
|---|---|---|
| Nombre/Descripción | `name` | text |
| Cantidad | `quantity` | integer |
| Peso | `weight_kg` | decimal |
| Alto | `height_cm` | decimal |
| Ancho | `width_cm` | decimal |
| Profundidad | `depth_cm` | decimal |
| Volumen | `volume_m3` | decimal |

Auto-detect strategy:
1. Read the first row as potential headers
2. Fuzzy match against known field names (nombre, descripcion, qty, cantidad, peso, weight, etc.)
3. Present mapping UI for user to confirm/adjust
4. Parse remaining rows using the mapping

## Generating Excel Export (Server-Side, ExcelJS)

### Installation
```bash
npm install exceljs
```

### Basic Export
```javascript
import ExcelJS from 'exceljs'

export async function generateContainerExport(containerData) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Contenedor')

  sheet.columns = [
    { header: 'Item', key: 'name', width: 30 },
    { header: 'Cantidad', key: 'quantity', width: 12 },
    { header: 'Peso (kg)', key: 'weight_kg', width: 12 },
    { header: 'Volumen (m³)', key: 'volume_m3', width: 12 },
    { header: 'Cliente', key: 'client_name', width: 20 },
    { header: 'Etiquetas', key: 'tags', width: 25 },
  ]

  // Style header row
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: 'FF1F2937' }
  }
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  containerData.items.forEach(item => sheet.addRow(item))

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}
```

### API Route for Download
```javascript
// src/app/api/export/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const containerId = searchParams.get('containerId')
  
  // Fetch data and generate...
  const buffer = await generateContainerExport(data)
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="contenedor-${code}.xlsx"`,
    },
  })
}
```

## DO NOT
- Do NOT parse Excel server-side unless absolutely necessary (it's heavy)
- Do NOT assume column order — always use mapping
- Do NOT ignore empty rows or malformed data — validate before insert
