# F4 — Importación de Packing Lists (Plan Detallado)

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Skills a leer antes**:
- `.agents/skills/excel-handling/SKILL.md`
- `.agents/skills/supabase-patterns/SKILL.md`

**Prerequisito**: F2.1 completado y verificado.
**Instalar al comenzar**: `npm install xlsx @tanstack/react-table`

---

## Paso 1: Instalar dependencias

```bash
npm install xlsx @tanstack/react-table
```

**Verificar**: `package.json` debe tener `xlsx` y `@tanstack/react-table` en `dependencies`.

---

## Paso 2: Crear migración SQL para packing lists

📄 `supabase/migrations/005_packing_lists.sql`

```sql
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
```

**Acción**: Ejecutar en el SQL Editor de Supabase usando el MCP tool `apply_migration`.

---

## Paso 3: Crear componente FileUpload reutilizable

📄 `src/components/ui/FileUpload.js`

```javascript
'use client'

import { useState, useRef } from 'react'
import { Upload, File, X } from 'lucide-react'

export default function FileUpload({ onFile, accept = '.xlsx,.xls', label = 'Arrastrá un archivo aquí' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) processFile(file)
  }

  function processFile(file) {
    setFileName(file.name)
    onFile(file)
  }

  function handleClear() {
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ''
    onFile(null)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : fileName
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {fileName ? (
        <div className="flex items-center justify-center gap-3">
          <File className="w-6 h-6 text-green-600" />
          <span className="text-sm font-medium text-green-700">{fileName}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            className="p-1 rounded-full hover:bg-green-100"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      ) : (
        <div>
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Formatos: .xlsx, .xls</p>
        </div>
      )}
    </div>
  )
}
```

---

## Paso 4: Crear utilidad de parseo Excel

📄 `src/lib/excel/parser.js`

```javascript
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
```

---

## Paso 5: Crear componente ColumnMapper

📄 `src/components/packing-list/ColumnMapper.js`

```javascript
'use client'

import { useState, useEffect } from 'react'
import { autoDetectMapping } from '@/lib/excel/parser'

const FIELDS = [
  { key: 'name', label: 'Nombre / Descripción', required: true },
  { key: 'quantity', label: 'Cantidad', required: true },
  { key: 'weight_kg', label: 'Peso (kg)', required: false },
  { key: 'height_cm', label: 'Alto (cm)', required: false },
  { key: 'width_cm', label: 'Ancho (cm)', required: false },
  { key: 'depth_cm', label: 'Profundidad (cm)', required: false },
  { key: 'volume_m3', label: 'Volumen (m³)', required: false },
]

export default function ColumnMapper({ headers, previewRows, onConfirm }) {
  const [mapping, setMapping] = useState({})

  useEffect(() => {
    const detected = autoDetectMapping(headers)
    setMapping(detected)
  }, [headers])

  function handleChange(field, colIndex) {
    setMapping(prev => ({
      ...prev,
      [field]: colIndex === '' ? undefined : parseInt(colIndex),
    }))
  }

  const isValid = mapping.name !== undefined && mapping.quantity !== undefined

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Mapeo de Columnas</h3>
        <p className="text-xs text-gray-400 mb-4">
          Asociá cada campo con la columna correspondiente del Excel. Los campos marcados con * son obligatorios.
        </p>

        <div className="space-y-3">
          {FIELDS.map(field => (
            <div key={field.key} className="flex items-center gap-4">
              <label className="w-48 text-sm text-gray-600">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <select
                value={mapping[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">— No mapear —</option>
                {headers.map((h, i) => (
                  <option key={i} value={i}>Columna {i + 1}: {h}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Preview (primeras 5 filas)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {FIELDS.filter(f => mapping[f.key] !== undefined).map(f => (
                  <th key={f.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {FIELDS.filter(f => mapping[f.key] !== undefined).map(f => (
                    <td key={f.key} className="px-3 py-2 text-gray-700">
                      {row[mapping[f.key]] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={() => onConfirm(mapping)}
        disabled={!isValid}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        Confirmar Mapeo e Importar ({previewRows.length} filas)
      </button>
    </div>
  )
}
```

---

## Paso 6: Crear Server Actions para packing list

📄 `src/app/contenedores/[id]/packing-list/actions.js`

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function importPackingList(containerId, fileName, items) {
  const supabase = await createClient()

  // Create or replace packing list
  const { data: existing } = await supabase
    .from('packing_lists')
    .select('id')
    .eq('container_id', containerId)
    .single()

  if (existing) {
    // Delete existing items
    await supabase.from('packing_list_items').delete().eq('packing_list_id', existing.id)
    await supabase.from('packing_lists').delete().eq('id', existing.id)
  }

  // Create new packing list
  const totalWeight = items.reduce((sum, i) => sum + (i.weight_kg || 0), 0)
  const totalVolume = items.reduce((sum, i) => sum + (i.volume_m3 || 0), 0)

  const { data: pl, error: plError } = await supabase
    .from('packing_lists')
    .insert({
      container_id: containerId,
      file_name: fileName,
      total_items: items.length,
      total_weight_kg: totalWeight,
      total_volume_m3: totalVolume,
    })
    .select()
    .single()

  if (plError) throw new Error(`Error al crear packing list: ${plError.message}`)

  // Insert items
  const rows = items.map((item, idx) => ({
    packing_list_id: pl.id,
    name: item.name || 'Sin nombre',
    quantity: parseInt(item.quantity) || 1,
    weight_kg: parseFloat(item.weight_kg) || null,
    height_cm: parseFloat(item.height_cm) || null,
    width_cm: parseFloat(item.width_cm) || null,
    depth_cm: parseFloat(item.depth_cm) || null,
    volume_m3: parseFloat(item.volume_m3) || null,
    sort_order: idx,
  }))

  const { error: itemsError } = await supabase
    .from('packing_list_items')
    .insert(rows)

  if (itemsError) throw new Error(`Error al insertar items: ${itemsError.message}`)

  revalidatePath(`/contenedores/${containerId}/packing-list`)
  revalidatePath(`/contenedores/${containerId}`)
  return { success: true, count: items.length }
}

export async function getPackingList(containerId) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('packing_lists')
    .select('*, packing_list_items(*)')
    .eq('container_id', containerId)
    .single()

  return data
}

export async function deletePackingListItem(itemId, containerId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('packing_list_items')
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(`Error al eliminar item: ${error.message}`)
  revalidatePath(`/contenedores/${containerId}/packing-list`)
}
```

---

## Paso 7: Crear componente PackingListImporter

📄 `src/components/packing-list/PackingListImporter.js`

```javascript
'use client'

import { useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import ColumnMapper from '@/components/packing-list/ColumnMapper'
import { parseExcelFile } from '@/lib/excel/parser'
import { importPackingList } from '@/app/contenedores/[id]/packing-list/actions'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

export default function PackingListImporter({ containerId }) {
  const [step, setStep] = useState('upload') // upload | mapping | importing | done
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [fileName, setFileName] = useState('')
  const router = useRouter()

  async function handleFile(file) {
    if (!file) {
      setParsed(null)
      setStep('upload')
      return
    }

    setError(null)
    try {
      const data = await parseExcelFile(file)
      setParsed(data)
      setFileName(file.name)
      setStep('mapping')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleConfirm(mapping) {
    setStep('importing')
    setError(null)

    try {
      const items = parsed.rows.map(row => ({
        name: mapping.name !== undefined ? String(row[mapping.name] || '') : '',
        quantity: mapping.quantity !== undefined ? row[mapping.quantity] : 1,
        weight_kg: mapping.weight_kg !== undefined ? row[mapping.weight_kg] : null,
        height_cm: mapping.height_cm !== undefined ? row[mapping.height_cm] : null,
        width_cm: mapping.width_cm !== undefined ? row[mapping.width_cm] : null,
        depth_cm: mapping.depth_cm !== undefined ? row[mapping.depth_cm] : null,
        volume_m3: mapping.volume_m3 !== undefined ? row[mapping.volume_m3] : null,
      })).filter(item => item.name.trim() !== '')

      const res = await importPackingList(containerId, fileName, items)
      setResult(res)
      setStep('done')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setStep('mapping')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <FileUpload onFile={handleFile} label="Arrastrá el packing list en Excel aquí" />
      )}

      {step === 'mapping' && parsed && (
        <ColumnMapper
          headers={parsed.headers}
          previewRows={parsed.rows}
          onConfirm={handleConfirm}
        />
      )}

      {step === 'importing' && (
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-gray-500">Importando items...</p>
        </div>
      )}

      {step === 'done' && result && (
        <div className="bg-green-50 rounded-xl p-8 border border-green-200 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-green-700">
            ¡{result.count} items importados exitosamente!
          </p>
          <button
            type="button"
            onClick={() => { setParsed(null); setResult(null); setStep('upload') }}
            className="mt-4 text-sm text-green-600 hover:underline"
          >
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Paso 8: Crear componente PackingListTable

📄 `src/components/packing-list/PackingListTable.js`

```javascript
'use client'

import { Trash2 } from 'lucide-react'
import { deletePackingListItem } from '@/app/contenedores/[id]/packing-list/actions'
import { useRouter } from 'next/navigation'

export default function PackingListTable({ items = [], containerId }) {
  const router = useRouter()

  async function handleDelete(itemId) {
    if (!confirm('¿Eliminar este item?')) return
    await deletePackingListItem(itemId, containerId)
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
        <p className="text-sm text-gray-400">No hay items en el packing list.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Peso (kg)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alto</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ancho</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prof.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vol (m³)</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{item.weight_kg ?? '—'}</td>
                <td className="px-4 py-3 text-right">{item.height_cm ?? '—'}</td>
                <td className="px-4 py-3 text-right">{item.width_cm ?? '—'}</td>
                <td className="px-4 py-3 text-right">{item.depth_cm ?? '—'}</td>
                <td className="px-4 py-3 text-right">{item.volume_m3 ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-3" colSpan={2}>Total</td>
              <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + (i.quantity || 0), 0)}</td>
              <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + (i.weight_kg || 0), 0).toFixed(2)}</td>
              <td className="px-4 py-3" colSpan={3}></td>
              <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + (i.volume_m3 || 0), 0).toFixed(4)}</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
```

---

## Paso 9: Crear página de packing list del contenedor

📄 `src/app/contenedores/[id]/packing-list/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getPackingList } from './actions'
import PackingListImporter from '@/components/packing-list/PackingListImporter'
import PackingListTable from '@/components/packing-list/PackingListTable'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'

export default async function PackingListPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: container } = await supabase
    .from('containers')
    .select('id, code')
    .eq('id', id)
    .single()

  if (!container) notFound()

  const packingList = await getPackingList(id)

  return (
    <div className="max-w-5xl">
      <Link href={`/contenedores/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver a {container.code}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Packing List — {container.code}</h1>
          {packingList && (
            <p className="text-gray-500 text-sm">
              {packingList.total_items} items · {packingList.file_name || 'Sin archivo'}
            </p>
          )}
        </div>
      </div>

      {/* Importer (always visible to allow re-import) */}
      <div className="mb-8">
        <PackingListImporter containerId={id} />
      </div>

      {/* Table */}
      {packingList?.packing_list_items && (
        <PackingListTable
          items={packingList.packing_list_items}
          containerId={id}
        />
      )}
    </div>
  )
}
```

---

## Paso 10: Agregar link a packing list en la página de detalle del contenedor

En `src/app/contenedores/[id]/page.js`, agregar un botón **después** del botón "Calculadora de Costos" y **antes** del botón "Eliminar":

```javascript
<Link
  href={`/contenedores/${id}/packing-list`}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
>
  <FileSpreadsheet className="w-4 h-4" /> Packing List
</Link>
```

**Importante**: Agregar `FileSpreadsheet` al import de `lucide-react` al inicio del archivo.

---

## Paso 11: Verificar F2.2

```bash
npm run build
```

**Debe compilar sin errores.**

```bash
git add -A
git commit -m "feat(F2.2): packing list import with Excel parsing and column mapping" --no-verify
git push origin master
```

**Verificar visualmente**: `npm run dev` → Abrir un contenedor → Click "Packing List" → Subir un Excel → Mapeo de columnas → Ver tabla con datos importados.

---

## Verificación Final de Phase 2.2

| Check | Esperado |
|---|---|
| `/contenedores/[id]/packing-list` | Página con importer y tabla |
| Drag & drop Excel | Archivo se parsea y muestra preview |
| Mapeo de columnas | Auto-detecta y permite ajustar |
| Importar | Items se guardan en DB |
| Tabla | Muestra items con totales |
| Re-importar | Reemplaza datos anteriores |
| `npm run build` | Sin errores |
