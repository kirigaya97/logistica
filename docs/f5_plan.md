# F5 — Clientes + Etiquetas + Clasificación (Plan Detallado)

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Skills a leer antes**:
- `.agents/skills/supabase-patterns/SKILL.md`

**Prerequisito**: F4 (Packing Lists) completado y verificado.
**No instalar paquetes nuevos** — todo lo necesario ya está instalado.

---

## Resumen de archivos a crear/modificar:

| Archivo | Tipo |
|---|---|
| `supabase/migrations/006_clients_tags.sql` | Migración: `clients`, `client_rate_history`, `tags`, `item_tags`, ALTER packing_list_items |
| `src/app/clientes/page.js` | REEMPLAZAR placeholder con lista real |
| `src/app/clientes/nuevo/page.js` | Formulario de creación de cliente |
| `src/app/clientes/[id]/page.js` | Ficha de cliente con contenedores asociados |
| `src/app/clientes/actions.js` | Server Actions (CRUD clientes) |
| `src/app/etiquetas/page.js` | REEMPLAZAR placeholder con lista de etiquetas |
| `src/app/etiquetas/actions.js` | Server Actions (CRUD etiquetas) |
| `src/components/clientes/ClientForm.js` | Formulario reutilizable |
| `src/components/clientes/ClientSummary.js` | Resumen con contenedores asociados |
| `src/components/packing-list/ItemClassifier.js` | Asignar cliente + etiquetas a items |
| `src/components/ui/TagInput.js` | Input de etiquetas con sugerencias |
| `src/app/contenedores/[id]/packing-list/page.js` | MODIFICAR: agregar clasificación a packing list |
| `src/app/contenedores/[id]/packing-list/actions.js` | MODIFICAR: agregar actions de clasificación |

---

## Paso 1: Crear migración SQL para clientes y etiquetas

📄 `supabase/migrations/006_clients_tags.sql`

```sql
-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  international_rate DECIMAL(12,2),
  local_rate DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Historial de tarifas de clientes
CREATE TABLE IF NOT EXISTS client_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('international', 'local')),
  old_value DECIMAL(12,2),
  new_value DECIMAL(12,2),
  changed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_rate_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON client_rate_history
  FOR ALL USING (auth.role() = 'authenticated');

-- Tabla de etiquetas
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(normalized_name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Tabla de relación items-etiquetas (many-to-many)
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES packing_list_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(item_id, tag_id)
);

ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON item_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Agregar client_id a packing_list_items
ALTER TABLE packing_list_items
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_packing_list_items_client ON packing_list_items(client_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_client_rate_history_client ON client_rate_history(client_id);
```

**Acción**: Ejecutar en Supabase con MCP `apply_migration`.

---

## Paso 2: Crear Server Actions para clientes

📄 `src/app/clientes/actions.js`

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const clientSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  location: z.string().optional(),
  international_rate: z.string().optional(),
  local_rate: z.string().optional(),
  notes: z.string().optional(),
})

export async function createClientAction(formData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = clientSchema.parse(raw)

  const insertData = {
    name: parsed.name,
    location: parsed.location || null,
    international_rate: parsed.international_rate ? parseFloat(parsed.international_rate) : null,
    local_rate: parsed.local_rate ? parseFloat(parsed.local_rate) : null,
    notes: parsed.notes || null,
  }

  const { error } = await supabase
    .from('clients')
    .insert(insertData)

  if (error) throw new Error(`Error al crear cliente: ${error.message}`)

  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function updateClientAction(id, formData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = clientSchema.parse(raw)

  // Get current values for rate history
  const { data: current } = await supabase
    .from('clients')
    .select('international_rate, local_rate')
    .eq('id', id)
    .single()

  const updateData = {
    name: parsed.name,
    location: parsed.location || null,
    international_rate: parsed.international_rate ? parseFloat(parsed.international_rate) : null,
    local_rate: parsed.local_rate ? parseFloat(parsed.local_rate) : null,
    notes: parsed.notes || null,
  }

  // Record rate changes in history
  if (current) {
    const newIntRate = updateData.international_rate
    const newLocalRate = updateData.local_rate

    if (current.international_rate !== newIntRate && (current.international_rate || newIntRate)) {
      await supabase.from('client_rate_history').insert({
        client_id: id,
        rate_type: 'international',
        old_value: current.international_rate,
        new_value: newIntRate,
      })
    }
    if (current.local_rate !== newLocalRate && (current.local_rate || newLocalRate)) {
      await supabase.from('client_rate_history').insert({
        client_id: id,
        rate_type: 'local',
        old_value: current.local_rate,
        new_value: newLocalRate,
      })
    }
  }

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Error al actualizar cliente: ${error.message}`)

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
}

export async function deleteClientAction(id) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar cliente: ${error.message}`)
  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function getClients() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  if (error) throw new Error(`Error al obtener clientes: ${error.message}`)
  return data || []
}

export async function getClientWithHistory(id) {
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) return null

  // Get rate history
  const { data: rateHistory } = await supabase
    .from('client_rate_history')
    .select('*')
    .eq('client_id', id)
    .order('changed_at', { ascending: false })

  // Get items assigned to this client (with packing list and container info)
  const { data: items } = await supabase
    .from('packing_list_items')
    .select(`
      id, name, quantity, weight_kg, volume_m3,
      packing_lists!inner(
        id, container_id,
        containers!inner(id, code, status, origin_warehouse, eta, etd)
      )
    `)
    .eq('client_id', id)

  return {
    ...client,
    rate_history: rateHistory || [],
    items: items || [],
  }
}
```

---

## Paso 3: Crear Server Actions para etiquetas

📄 `src/app/etiquetas/actions.js`

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function normalizeTagName(name) {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ')
}

export async function createTag(name) {
  const supabase = await createClient()
  const normalizedName = normalizeTagName(name)

  // Check if exists
  const { data: existing } = await supabase
    .from('tags')
    .select('id, name')
    .eq('normalized_name', normalizedName)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: name.trim(),
      normalized_name: normalizedName,
    })
    .select()
    .single()

  if (error) throw new Error(`Error al crear etiqueta: ${error.message}`)
  revalidatePath('/etiquetas')
  return data
}

export async function searchTags(query) {
  const supabase = await createClient()

  if (!query || query.length < 1) {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name')
      .limit(20)
    return data || []
  }

  const normalized = normalizeTagName(query)
  const { data } = await supabase
    .from('tags')
    .select('*')
    .ilike('normalized_name', `%${normalized}%`)
    .order('name')
    .limit(20)

  return data || []
}

export async function deleteTag(id) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar etiqueta: ${error.message}`)
  revalidatePath('/etiquetas')
}

export async function getTagsWithItemCount() {
  const supabase = await createClient()

  const { data: tags } = await supabase
    .from('tags')
    .select('*, item_tags(count)')
    .order('name')

  return (tags || []).map(tag => ({
    ...tag,
    item_count: tag.item_tags?.[0]?.count || 0,
  }))
}

export async function getTagDetail(id) {
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (!tag) return null

  // Get items with this tag (including container info)
  const { data: itemTags } = await supabase
    .from('item_tags')
    .select(`
      packing_list_items!inner(
        id, name, quantity, weight_kg, volume_m3, client_id,
        packing_lists!inner(
          container_id,
          containers!inner(id, code, status, origin_warehouse, eta)
        )
      )
    `)
    .eq('tag_id', id)

  return {
    ...tag,
    items: itemTags?.map(it => it.packing_list_items) || [],
  }
}
```

---

## Paso 4: Crear Server Actions de clasificación (agregar a packing list actions)

Agregar las siguientes funciones al **final** de:
📄 `src/app/contenedores/[id]/packing-list/actions.js`

```javascript
// --- Clasificación: cliente + etiquetas ---

export async function assignClientToItems(itemIds, clientId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('packing_list_items')
    .update({ client_id: clientId || null })
    .in('id', itemIds)

  if (error) throw new Error(`Error al asignar cliente: ${error.message}`)
}

export async function addTagToItems(itemIds, tagId) {
  const supabase = await createClient()

  const rows = itemIds.map(itemId => ({
    item_id: itemId,
    tag_id: tagId,
  }))

  // Use upsert to avoid duplicate errors
  const { error } = await supabase
    .from('item_tags')
    .upsert(rows, { onConflict: 'item_id,tag_id', ignoreDuplicates: true })

  if (error) throw new Error(`Error al asignar etiqueta: ${error.message}`)
}

export async function removeTagFromItem(itemId, tagId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('item_tags')
    .delete()
    .eq('item_id', itemId)
    .eq('tag_id', tagId)

  if (error) throw new Error(`Error al quitar etiqueta: ${error.message}`)
}

export async function getItemsWithClassification(containerId) {
  const supabase = await createClient()

  const { data: packingList } = await supabase
    .from('packing_lists')
    .select('id')
    .eq('container_id', containerId)
    .single()

  if (!packingList) return []

  const { data: items } = await supabase
    .from('packing_list_items')
    .select(`
      *,
      clients(id, name),
      item_tags(
        tags(id, name, color)
      )
    `)
    .eq('packing_list_id', packingList.id)
    .order('sort_order')

  return (items || []).map(item => ({
    ...item,
    client: item.clients || null,
    tags: item.item_tags?.map(it => it.tags) || [],
  }))
}
```

---

## Paso 5: Crear componente TagInput

📄 `src/components/ui/TagInput.js`

```javascript
'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { searchTags, createTag } from '@/app/etiquetas/actions'

export default function TagInput({ selectedTags = [], onAdd, onRemove }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 1) {
        setLoading(true)
        const results = await searchTags(query)
        setSuggestions(results.filter(t => !selectedTags.some(st => st.id === t.id)))
        setLoading(false)
        setIsOpen(true)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query, selectedTags])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)
          && inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSelect(tag) {
    onAdd(tag)
    setQuery('')
    setIsOpen(false)
  }

  async function handleCreate() {
    if (!query.trim()) return
    setLoading(true)
    const tag = await createTag(query.trim())
    onAdd(tag)
    setQuery('')
    setIsOpen(false)
    setLoading(false)
  }

  async function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) {
        handleSelect(suggestions[0])
      } else if (query.trim()) {
        handleCreate()
      }
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          placeholder="Buscar o crear etiqueta..."
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {loading && (
              <div className="px-3 py-2 text-xs text-gray-400">Buscando...</div>
            )}

            {suggestions.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelect(tag)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color || '#6B7280' }}
                />
                {tag.name}
              </button>
            ))}

            {!loading && query.trim() && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase()) && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-2 border-t border-gray-100"
              >
                <Plus className="w-3 h-3" />
                Crear "{query.trim()}"
              </button>
            )}

            {!loading && suggestions.length === 0 && !query.trim() && (
              <div className="px-3 py-2 text-xs text-gray-400">Escribí para buscar</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Paso 6: Crear componente ItemClassifier

📄 `src/components/packing-list/ItemClassifier.js`

```javascript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TagInput from '@/components/ui/TagInput'
import {
  assignClientToItems,
  addTagToItems,
  removeTagFromItem,
} from '@/app/contenedores/[id]/packing-list/actions'
import { getClients } from '@/app/clientes/actions'
import { Users, Tags, CheckSquare, Square, Loader2 } from 'lucide-react'

export default function ItemClassifier({ items, containerId }) {
  const [selectedItems, setSelectedItems] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getClients().then(setClients)
  }, [])

  const allSelected = items.length > 0 && selectedItems.length === items.length
  const someSelected = selectedItems.length > 0

  function toggleItem(id) {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    setSelectedItems(allSelected ? [] : items.map(i => i.id))
  }

  async function handleAssignClient(clientId) {
    if (!someSelected) return
    setLoading(true)
    await assignClientToItems(selectedItems, clientId)
    router.refresh()
    setLoading(false)
  }

  async function handleAddTag(tag) {
    if (!someSelected) return
    setLoading(true)
    await addTagToItems(selectedItems, tag.id)
    router.refresh()
    setLoading(false)
  }

  async function handleRemoveTagFromItem(itemId, tag) {
    setLoading(true)
    await removeTagFromItem(itemId, tag.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {someSelected && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-blue-700">
            {selectedItems.length} item(s) seleccionado(s)
          </span>

          {/* Client assignment */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <select
              onChange={(e) => handleAssignClient(e.target.value || null)}
              className="px-2 py-1 border border-blue-300 rounded-lg text-sm bg-white"
              defaultValue=""
            >
              <option value="">Asignar cliente...</option>
              <option value="">— Sin cliente —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tag assignment */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Tags className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <TagInput
                selectedTags={[]}
                onAdd={handleAddTag}
                onRemove={() => {}}
              />
            </div>
          </div>

          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
      )}

      {/* Table with checkboxes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <button type="button" onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                    {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Peso (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vol (m³)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etiquetas</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    selectedItems.includes(item.id) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleItem(item.id)} className="text-gray-400 hover:text-gray-600">
                      {selectedItems.includes(item.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{item.weight_kg ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{item.volume_m3 ?? '—'}</td>
                  <td className="px-4 py-3">
                    {item.client ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {item.client.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromItem(item.id, tag)}
                            className="hover:text-red-500"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      )) || <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

**Importante**: Agregar `X` al import de `lucide-react` al inicio del archivo.

---

## Paso 7: Crear componente ClientForm

📄 `src/components/clientes/ClientForm.js`

```javascript
import Link from 'next/link'

export default function ClientForm({ action, client = null, submitLabel = 'Crear Cliente' }) {
  return (
    <form action={action} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={client?.name || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Nombre del cliente"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={client?.location || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Ciudad, Provincia"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="international_rate" className="block text-sm font-medium text-gray-700 mb-2">
            Tarifa Internacional (USD)
          </label>
          <input
            id="international_rate"
            name="international_rate"
            type="number"
            step="0.01"
            defaultValue={client?.international_rate || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="local_rate" className="block text-sm font-medium text-gray-700 mb-2">
            Tarifa Local (ARS)
          </label>
          <input
            id="local_rate"
            name="local_rate"
            type="number"
            step="0.01"
            defaultValue={client?.local_rate || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={client?.notes || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {submitLabel}
        </button>
        <Link
          href="/clientes"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
```

---

## Paso 8: Crear componente ClientSummary

📄 `src/components/clientes/ClientSummary.js`

```javascript
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES } from '@/lib/constants'
import { Container, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

export default function ClientSummary({ client }) {
  // Group items by container
  const containerMap = {}
  client.items?.forEach(item => {
    const container = item.packing_lists?.containers
    if (!container) return
    if (!containerMap[container.id]) {
      containerMap[container.id] = {
        ...container,
        items: [],
        totalQty: 0,
        totalWeight: 0,
        totalVolume: 0,
      }
    }
    containerMap[container.id].items.push(item)
    containerMap[container.id].totalQty += item.quantity || 0
    containerMap[container.id].totalWeight += parseFloat(item.weight_kg) || 0
    containerMap[container.id].totalVolume += parseFloat(item.volume_m3) || 0
  })

  const containers = Object.values(containerMap)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500">Contenedores</p>
          <p className="text-2xl font-bold text-blue-700">{containers.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500">Items totales</p>
          <p className="text-2xl font-bold text-green-700">{client.items?.length || 0}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500">Vol. total (m³)</p>
          <p className="text-2xl font-bold text-purple-700">
            {containers.reduce((s, c) => s + c.totalVolume, 0).toFixed(4)}
          </p>
        </div>
      </div>

      {/* Containers list */}
      {containers.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Contenedores asociados</h3>
          {containers.map(c => {
            const wh = WAREHOUSES[c.origin_warehouse]
            return (
              <Link
                key={c.id}
                href={`/contenedores/${c.id}`}
                className="block bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Container className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{c.code}</p>
                      <p className="text-xs text-gray-500">
                        {wh?.flag} {wh?.label} · {c.totalQty} items · {c.totalWeight.toFixed(2)} kg · {c.totalVolume.toFixed(4)} m³
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No hay contenedores asociados a este cliente.</p>
      )}

      {/* Rate history */}
      {client.rate_history?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Historial de tarifas</h3>
          <div className="space-y-2">
            {client.rate_history.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">
                  {new Date(entry.changed_at).toLocaleDateString('es-AR')}
                </span>
                <span className="font-medium capitalize">{entry.rate_type === 'international' ? 'Internacional' : 'Local'}:</span>
                <span className="text-gray-400">{entry.old_value ?? '—'}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{entry.new_value ?? '—'}</span>
                {entry.new_value > entry.old_value ? (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Paso 9: Reemplazar página de clientes (lista)

Reemplazar **completamente**:
📄 `src/app/clientes/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, MapPin } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <Link
          href="/clientes/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          Error al cargar clientes: {error.message}
        </div>
      )}

      {clients && clients.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No hay clientes</p>
          <Link
            href="/clientes/nuevo"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear el primero
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map((client) => (
          <Link
            key={client.id}
            href={`/clientes/${client.id}`}
            className="block bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{client.name}</h3>
                {client.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {client.location}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              {client.international_rate && (
                <span>Int: USD {client.international_rate}</span>
              )}
              {client.local_rate && (
                <span>Local: ARS {client.local_rate}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## Paso 10: Crear página de nuevo cliente

📄 `src/app/clientes/nuevo/page.js`

```javascript
import { createClientAction } from '@/app/clientes/actions'
import ClientForm from '@/components/clientes/ClientForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Cliente</h1>
      <ClientForm action={createClientAction} />
    </div>
  )
}
```

---

## Paso 11: Crear página de detalle de cliente

📄 `src/app/clientes/[id]/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getClientWithHistory, updateClientAction, deleteClientAction } from '@/app/clientes/actions'
import ClientForm from '@/components/clientes/ClientForm'
import ClientSummary from '@/components/clientes/ClientSummary'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'

export default async function ClientDetailPage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const editing = sp?.edit === 'true'

  const client = await getClientWithHistory(id)
  if (!client) notFound()

  const updateAction = updateClientAction.bind(null, id)
  const deleteAction = deleteClientAction.bind(null, id)

  return (
    <div className="max-w-4xl">
      <Link href="/clientes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver a clientes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{client.name}</h1>
          {client.location && (
            <p className="text-gray-500 text-sm mt-1">{client.location}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href={`/clientes/${id}?edit=true`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Editar
          </Link>
          <form action={deleteAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Eliminar
            </button>
          </form>
        </div>
      </div>

      {/* Info cards */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Tarifa Internacional</p>
            <p className="font-medium">
              {client.international_rate ? `USD ${client.international_rate}` : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Tarifa Local</p>
            <p className="font-medium">
              {client.local_rate ? `ARS ${client.local_rate}` : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 col-span-2">
            <p className="text-xs text-gray-500 mb-1">Notas</p>
            <p className="text-sm text-gray-600">{client.notes || '—'}</p>
          </div>
        </div>
      </div>

      {/* Edit form or Summary */}
      {editing ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Cliente</h2>
          <ClientForm action={updateAction} client={client} submitLabel="Guardar Cambios" />
        </div>
      ) : (
        <ClientSummary client={client} />
      )}
    </div>
  )
}
```

---

## Paso 12: Reemplazar página de etiquetas

Reemplazar **completamente**:
📄 `src/app/etiquetas/page.js`

```javascript
import { getTagsWithItemCount } from '@/app/etiquetas/actions'
import { deleteTag } from '@/app/etiquetas/actions'
import { Tags, Hash, Trash2 } from 'lucide-react'

export default async function EtiquetasPage() {
  const tags = await getTagsWithItemCount()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Etiquetas</h1>
        <p className="text-sm text-gray-500">
          Las etiquetas se crean al clasificar items en los packing lists
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Tags className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No hay etiquetas</p>
          <p className="text-xs text-gray-400">Las etiquetas se crean al clasificar items en los packing lists</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etiqueta</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creada</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {tags.map(tag => {
                const deleteWithId = deleteTag.bind(null, tag.id)
                return (
                  <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">{tag.name}</span>
                        <span className="text-xs text-gray-400">({tag.normalized_name})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {tag.item_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(tag.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      {tag.item_count === 0 && (
                        <form action={deleteWithId}>
                          <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

---

## Paso 13: Modificar página de packing list para incluir clasificación

Reemplazar **completamente**:
📄 `src/app/contenedores/[id]/packing-list/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getPackingList, getItemsWithClassification } from './actions'
import PackingListImporter from '@/components/packing-list/PackingListImporter'
import ItemClassifier from '@/components/packing-list/ItemClassifier'
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
  const classifiedItems = packingList ? await getItemsWithClassification(id) : []

  return (
    <div className="max-w-6xl">
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

      {/* Classifier Table (replaces the old PackingListTable) */}
      {classifiedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Clasificación de Items</h2>
          <ItemClassifier items={classifiedItems} containerId={id} />
        </div>
      )}
    </div>
  )
}
```

---

## Paso 14: Verificar F5

```bash
npm run build
```

**Debe compilar sin errores.**

```bash
git add -A
git commit -m "feat(F5): clients + tags + item classification" --no-verify
git push origin master
```

**Verificar visualmente**:
1. `npm run dev` → `/clientes` → Crear un cliente con nombre, ubicación y tarifas
2. `/clientes/[id]` → Ver ficha del cliente, editar tarifa → verificar historial
3. `/etiquetas` → Verificar que no hay etiquetas (lista vacía)
4. Abrir un contenedor con packing list → `/contenedores/[id]/packing-list`
5. Seleccionar items → Asignar cliente desde dropdown → Los items muestran el cliente
6. Seleccionar items → Escribir etiqueta en TagInput → Se crea y se asigna
7. `/etiquetas` → Verificar que la etiqueta aparece con conteo de items
8. `/clientes/[id]` → Verificar que el contenedor aparece en la ficha del cliente
9. `npm run build` → Sin errores

---

## Verificación Final de F5

| Check | Esperado |
|---|---|
| `/clientes` | Lista de clientes con cards |
| `/clientes/nuevo` | Formulario de creación funcional |
| `/clientes/[id]` | Ficha con tarifas, contenedores, historial |
| `/clientes/[id]?edit=true` | Formulario de edición inline |
| Cambiar tarifa | Se registra en historial |
| Eliminar cliente | Redirige a lista, items quedan sin cliente |
| `/etiquetas` | Lista de etiquetas con conteo de items |
| Eliminar etiqueta sin items | Se borra correctamente |
| Packing list → seleccionar items | Bulk actions bar aparece |
| Asignar cliente a items | Items muestran badge de cliente |
| Asignar etiqueta a items | Items muestran pills de etiquetas |
| Quitar etiqueta de item individual | Se borra la asociación |
| Crear etiqueta nueva desde TagInput | Se crea y se asigna |
| Sugerir etiqueta existente | TagInput muestra autocomplete |
| `npm run build` | Sin errores |
