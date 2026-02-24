# F2.1 — Gestión de Contenedores (Plan Detallado)

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Skills a leer antes**: `.agents/skills/supabase-patterns/SKILL.md`  
**Prerequisito**: F1.1 completado, 001_profiles.sql ejecutado en Supabase  
**No instalar paquetes nuevos** — todo lo necesario ya está instalado.

---

## Paso 1: Ejecutar migración SQL en Supabase

Copiar el contenido de `supabase/migrations/002_containers.sql` (creado en Paso 2) al SQL Editor de Supabase y ejecutar.

---

## Paso 2: Crear migración SQL

📄 `supabase/migrations/002_containers.sql`

```sql
-- Tabla de contenedores
CREATE TABLE IF NOT EXISTS containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  origin_warehouse TEXT NOT NULL CHECK (origin_warehouse IN ('HK', 'CH', 'USA')),
  container_type TEXT NOT NULL CHECK (container_type IN ('20', '40', '40HC')),
  status TEXT NOT NULL DEFAULT 'deposito' CHECK (status IN ('deposito', 'transito', 'aduana', 'finalizado')),
  description TEXT,
  eta DATE,
  etd DATE,
  exchange_rate DECIMAL(12,2),
  exchange_rate_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON containers
  FOR ALL USING (auth.role() = 'authenticated');

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Acción**: Copiar este SQL y ejecutarlo en el SQL Editor del dashboard de Supabase.

---

## Paso 3: Crear StatusBadge component

📄 `src/components/ui/StatusBadge.js`

```javascript
import { CONTAINER_STATES } from '@/lib/constants'

export default function StatusBadge({ status }) {
  const state = CONTAINER_STATES[status]
  if (!state) return null

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${state.color}`}>
      {state.label}
    </span>
  )
}
```

---

## Paso 4: Crear Server Actions

📄 `src/app/contenedores/actions.js`

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const containerSchema = z.object({
  origin_warehouse: z.enum(['HK', 'CH', 'USA']),
  container_type: z.enum(['20', '40', '40HC']),
  description: z.string().optional(),
  eta: z.string().optional(),
  etd: z.string().optional(),
  notes: z.string().optional(),
})

async function generateCode(supabase, origin) {
  const year = new Date().getFullYear()
  const prefix = `${origin}-${year}-`

  const { data } = await supabase
    .from('containers')
    .select('code')
    .like('code', `${prefix}%`)
    .order('code', { ascending: false })
    .limit(1)

  let seq = 1
  if (data && data.length > 0) {
    const lastSeq = parseInt(data[0].code.split('-')[2], 10)
    seq = lastSeq + 1
  }

  return `${prefix}${String(seq).padStart(3, '0')}`
}

export async function createContainer(formData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = containerSchema.parse(raw)

  const code = await generateCode(supabase, parsed.origin_warehouse)

  const { error } = await supabase
    .from('containers')
    .insert({ ...parsed, code })

  if (error) throw new Error(`Error al crear contenedor: ${error.message}`)

  revalidatePath('/contenedores')
  redirect('/contenedores')
}

export async function updateContainerStatus(id, newStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('containers')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) throw new Error(`Error al actualizar estado: ${error.message}`)
  revalidatePath('/contenedores')
  revalidatePath(`/contenedores/${id}`)
}

export async function deleteContainer(id) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('containers')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar: ${error.message}`)
  revalidatePath('/contenedores')
  redirect('/contenedores')
}
```

---

## Paso 5: Crear ContainerFilters

📄 `src/components/contenedores/ContainerFilters.js`

```javascript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CONTAINER_STATES, WAREHOUSES } from '@/lib/constants'

export default function ContainerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilter(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/contenedores?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 mb-6">
      <select
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        value={searchParams.get('status') || ''}
        onChange={(e) => handleFilter('status', e.target.value)}
      >
        <option value="">Todos los estados</option>
        {Object.entries(CONTAINER_STATES).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <select
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        value={searchParams.get('origin') || ''}
        onChange={(e) => handleFilter('origin', e.target.value)}
      >
        <option value="">Todos los orígenes</option>
        {Object.entries(WAREHOUSES).map(([key, val]) => (
          <option key={key} value={key}>{val.flag} {val.label}</option>
        ))}
      </select>
    </div>
  )
}
```

---

## Paso 6: Crear ContainerCard

📄 `src/components/contenedores/ContainerCard.js`

```javascript
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES } from '@/lib/constants'
import { Calendar, MapPin } from 'lucide-react'

export default function ContainerCard({ container }) {
  const warehouse = WAREHOUSES[container.origin_warehouse]

  return (
    <Link
      href={`/contenedores/${container.id}`}
      className="block bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{container.code}</h3>
        <StatusBadge status={container.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{warehouse?.flag} {warehouse?.label} — {container.container_type}'</span>
        </div>

        {container.eta && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>ETA: {new Date(container.eta).toLocaleDateString('es-AR')}</span>
          </div>
        )}

        {container.description && (
          <p className="text-gray-400 truncate">{container.description}</p>
        )}
      </div>
    </Link>
  )
}
```

---

## Paso 7: Reemplazar página de contenedores (lista)

Reemplazar **completamente**:  
📄 `src/app/contenedores/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import ContainerCard from '@/components/contenedores/ContainerCard'
import ContainerFilters from '@/components/contenedores/ContainerFilters'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

export default async function ContenedoresPage({ searchParams }) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase
    .from('containers')
    .select('*')
    .order('created_at', { ascending: false })

  if (params?.status) {
    query = query.eq('status', params.status)
  }
  if (params?.origin) {
    query = query.eq('origin_warehouse', params.origin)
  }

  const { data: containers, error } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contenedores</h1>
        <Link
          href="/contenedores/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contenedor
        </Link>
      </div>

      <Suspense fallback={<div>Cargando filtros...</div>}>
        <ContainerFilters />
      </Suspense>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          Error al cargar contenedores: {error.message}
        </div>
      )}

      {containers && containers.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <p className="text-gray-400 mb-4">No hay contenedores</p>
          <Link
            href="/contenedores/nuevo"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear el primero
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {containers?.map((container) => (
          <ContainerCard key={container.id} container={container} />
        ))}
      </div>
    </div>
  )
}
```

---

## Paso 8: Crear formulario de nuevo contenedor

📄 `src/app/contenedores/nuevo/page.js`

```javascript
import { WAREHOUSES, CONTAINER_TYPES } from '@/lib/constants'
import { createContainer } from '@/app/contenedores/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevoContenedorPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/contenedores"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a contenedores
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Contenedor</h1>

      <form action={createContainer} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="origin_warehouse" className="block text-sm font-medium text-gray-700 mb-2">
              Depósito de Origen *
            </label>
            <select
              id="origin_warehouse"
              name="origin_warehouse"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {Object.entries(WAREHOUSES).map(([key, val]) => (
                <option key={key} value={key}>{val.flag} {val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="container_type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Contenedor *
            </label>
            <select
              id="container_type"
              name="container_type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {Object.entries(CONTAINER_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <input
            id="description"
            name="description"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Ej: Electrónicos varios"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="etd" className="block text-sm font-medium text-gray-700 mb-2">
              ETD (Salida estimada)
            </label>
            <input id="etd" name="etd" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label htmlFor="eta" className="block text-sm font-medium text-gray-700 mb-2">
              ETA (Arribo estimado)
            </label>
            <input id="eta" name="eta" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Crear Contenedor
          </button>
          <Link
            href="/contenedores"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
```

---

## Paso 9: Crear página de detalle

📄 `src/app/contenedores/[id]/page.js`

```javascript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES, CONTAINER_TYPES, CONTAINER_STATES } from '@/lib/constants'
import { updateContainerStatus, deleteContainer } from '@/app/contenedores/actions'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Box } from 'lucide-react'

const STATE_ORDER = ['deposito', 'transito', 'aduana', 'finalizado']

export default async function ContainerDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: container, error } = await supabase
    .from('containers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !container) notFound()

  const warehouse = WAREHOUSES[container.origin_warehouse]
  const type = CONTAINER_TYPES[container.container_type]
  const currentIdx = STATE_ORDER.indexOf(container.status)
  const nextStatus = STATE_ORDER[currentIdx + 1]
  const nextLabel = nextStatus ? CONTAINER_STATES[nextStatus]?.label : null

  const updateStatusWithId = updateContainerStatus.bind(null, id, nextStatus)
  const deleteWithId = deleteContainer.bind(null, id)

  return (
    <div className="max-w-4xl">
      <Link href="/contenedores" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{container.code}</h1>
            <p className="text-gray-500 text-sm mt-1">{container.description || 'Sin descripción'}</p>
          </div>
          <StatusBadge status={container.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Origen</p>
            <p className="font-medium"><MapPin className="w-4 h-4 inline mr-1" />{warehouse?.flag} {warehouse?.label}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Tipo</p>
            <p className="font-medium"><Box className="w-4 h-4 inline mr-1" />{type?.label}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">ETD</p>
            <p className="font-medium"><Calendar className="w-4 h-4 inline mr-1" />{container.etd ? new Date(container.etd).toLocaleDateString('es-AR') : '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">ETA</p>
            <p className="font-medium"><Calendar className="w-4 h-4 inline mr-1" />{container.eta ? new Date(container.eta).toLocaleDateString('es-AR') : '—'}</p>
          </div>
        </div>

        {container.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notas</h3>
            <p className="text-gray-500 text-sm bg-gray-50 rounded-lg p-4">{container.notes}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {nextStatus && (
            <form action={updateStatusWithId}>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Avanzar a: {nextLabel}
              </button>
            </form>
          )}
          <form action={deleteWithId}>
            <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              Eliminar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

---

## Paso 10: Verificar F2.1

```bash
npm run build
```

**Debe compilar sin errores.**

```bash
git add -A
git commit -m "feat(F2.1): container CRUD with auto-code and status flow" --no-verify
git push origin master
```

**Verificar visualmente**: `npm run dev` → `/contenedores` → Crear contenedor → Ver en lista → Abrir detalle → Avanzar estado.

---

## Sobre /calculadora-costos

La calculadora de costos NO tiene página propia en la sidebar. Es **contextual** a un contenedor y vive en `/contenedores/[id]/costos/` (Phase 3, F3.1). Esto es intencional porque cada cálculo de costos se hace PARA un contenedor específico.

La calculadora volumétrica SÍ es standalone (`/calculadora-volumetrica`) porque es una herramienta general que no requiere un contenedor existente.
