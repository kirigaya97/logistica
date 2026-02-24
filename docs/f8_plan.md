# F8 — Simulation Detail View & Configurable Cost Templates

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Skills a leer antes**:
- `.agents/skills/cost-calculator/SKILL.md`
- `.agents/skills/supabase-patterns/SKILL.md`

**Prerequisito**: F7 aplicado ✅

---

## Problema Actual

1. **Simulaciones sin detalle**: Al guardar una simulación en `/calculadora-costos`, el sidebar muestra solo nombre + FOB + fecha. No hay forma de ver el desglose completo (qué items, qué porcentajes, qué subtotales se usaron). A partir de esta feature, las simulaciones **nuevas** guardarán un `snapshot` con los subtotales y serán clickeables para ver el detalle. Simulaciones anteriores no se ven afectadas.

2. **Template único**: Solo existe un template "default" en `cost_template_config`. El usuario quiere perfiles configurables: "Salida Real", "Salida Cliente", y custom. Todos comparten los **mismos conceptos/items** pero configurados con **distintos valores** (porcentajes, montos fijos). Seleccionables desde un dropdown en el simulador.

---

## Paso 1: Migración DB — Multi-template support + snapshot

📄 `supabase/migrations/008_multi_templates.sql`

> Aplicar manualmente en Supabase SQL Editor. Luego crear el archivo local para tracking.

```sql
-- Add snapshot column to store full calculation result
ALTER TABLE cost_simulations 
  ADD COLUMN IF NOT EXISTS snapshot JSONB;

-- Drop the unique constraint on is_default (allows multiple templates)
DROP INDEX IF EXISTS one_default_template_idx;

-- Add slug column for programmatic identification
ALTER TABLE cost_template_config 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing default template
UPDATE cost_template_config 
  SET slug = 'default', name = 'Plantilla Base'
  WHERE is_default = true;

-- Seed "Salida Real" template (same items, user configures different values in config page)
INSERT INTO cost_template_config (name, slug, is_default, items)
SELECT 'Salida Real', 'salida_real', false, items
FROM cost_template_config WHERE slug = 'default'
ON CONFLICT (slug) DO NOTHING;

-- Seed "Salida Cliente" template (same items, user configures different values in config page)
INSERT INTO cost_template_config (name, slug, is_default, items)
SELECT 'Salida Cliente', 'salida_cliente', false, items
FROM cost_template_config WHERE slug = 'default'
ON CONFLICT (slug) DO NOTHING;
```

**Cambios clave**:
- `snapshot` column en `cost_simulations` para guardar el resultado completo de `calculateCosts()`
- Se elimina el constraint `one_default_template_idx` para permitir múltiples templates
- Se agrega `slug` como identificador único legible
- Se seedean 2 templates (Salida Real, Salida Cliente) — misma estructura, el usuario configura valores distintos desde `/calculadora-costos/config`

---

## Paso 2: Actualizar server actions — Simulations + Templates

📄 `src/app/calculadora-costos/actions.js`

**Modificar `saveSimulation`** — agregar parámetro `snapshot`:

```javascript
export async function saveSimulation(name, fobTotal, items, snapshot) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cost_simulations')
        .insert({
            name,
            fob_total: fobTotal,
            items,
            snapshot: snapshot || null,
        })
        .select()
        .single()

    if (error) throw new Error(`Error al guardar simulación: ${error.message}`)

    revalidatePath('/calculadora-costos')
    return data
}
```

**Agregar `getSimulation`**:

```javascript
export async function getSimulation(id) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('cost_simulations')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw new Error(`Error al obtener simulación: ${error.message}`)
    return data
}
```

**Agregar funciones de templates** (mantener `getDefaultTemplate` para compatibilidad):

```javascript
export async function getTemplates() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('cost_template_config')
        .select('id, name, slug, is_default')
        .order('is_default', { ascending: false })
        .order('name')

    return data || []
}

export async function getTemplateItems(slug) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('cost_template_config')
        .select('items')
        .eq('slug', slug)
        .maybeSingle()

    return data?.items || null
}

export async function saveTemplate(slug, items) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cost_template_config')
        .update({
            items,
            updated_at: new Date().toISOString()
        })
        .eq('slug', slug)

    if (error) throw new Error(`Error al guardar plantilla: ${error.message}`)

    revalidatePath('/calculadora-costos/config')
    revalidatePath('/calculadora-costos')
}

export async function createTemplate(name, slug, items) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cost_template_config')
        .insert({ name, slug, is_default: false, items })
        .select()
        .single()

    if (error) throw new Error(`Error al crear plantilla: ${error.message}`)

    revalidatePath('/calculadora-costos/config')
    return data
}

export async function deleteTemplate(slug) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cost_template_config')
        .delete()
        .eq('slug', slug)
        .neq('is_default', true)

    if (error) throw new Error(`Error al eliminar plantilla: ${error.message}`)

    revalidatePath('/calculadora-costos/config')
}
```

**Mantener** `saveDefaultTemplate` y `getDefaultTemplate` sin cambios.

---

## Paso 3: Actualizar `CostMatrix.js` — Pass result + read-only mode

📄 `src/components/calculadora/CostMatrix.js`

**Cambio 1**: Firma del componente → agregar `readOnly`:

```javascript
export default function CostMatrix({ calculation, onSave, readOnly = false }) {
```

**Cambio 2**: `handleSave` pasa `result` en el callback:

```javascript
await onSave({ fobTotal: fob, items, result })
```

**Cambio 3**: FOB input → agregar `disabled={readOnly}`:

```javascript
disabled={readOnly}
className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-lg font-medium ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
```

**Cambio 4**: Toggle Eye/EyeOff button → agregar `disabled={readOnly}`

**Cambio 5**: Ambos inputs de valor (% y $) → agregar `disabled={readOnly}`

**Cambio 6**: Ocultar floating save button si readOnly:

```javascript
{!readOnly && (
    <div className={`sticky bottom-6 ...`}>
        ...
    </div>
)}
```

---

## Paso 4: Actualizar `Simulator.js` — Template selector + snapshot save

📄 `src/components/calculadora/Simulator.js`

**Borrar todo y reemplazar con** la versión que:
1. Recibe props `templates` y `activeSlug`
2. En `handleSave`, extrae `result` del callback y crea un `snapshot` 
3. Pasa `snapshot` a `saveSimulation()`
4. En el sidebar, simulaciones **que tienen snapshot** muestran un icono Eye que linkea a `/calculadora-costos/[id]` (simulaciones viejas sin snapshot no muestran el link)
5. Arriba muestra el template selector (buttons/pills) que navegan via `?template=slug`

---

## Paso 5: Crear página de detalle de simulación

📄 **[NEW]** `src/app/calculadora-costos/[id]/page.js`

Server component que:
1. Fetch `getSimulation(id)` — si no tiene `snapshot`, redirect a `/calculadora-costos`
2. Reconstruye el `calculation` object desde `simulation.items`
3. Muestra tarjetas resumen (FOB, CIF, Base Imponible, Costo Total) desde `snapshot`
4. Renderiza `<CostMatrix readOnly={true} />` con los datos guardados
5. Link de vuelta a `/calculadora-costos`

---

## Paso 6: Actualizar la page principal del simulador

📄 `src/app/calculadora-costos/page.js`

- Lee `searchParams.template` (default: `'default'`)
- Fetch `getTemplates()` y `getTemplateItems(slug)` en paralelo
- Pasa `templates` y `activeSlug` al `<Simulator />`

---

## Paso 7: Actualizar config page — Gestionar múltiples plantillas

📄 `src/app/calculadora-costos/config/page.js`

- Lee `searchParams.slug` (default: `'default'`)  
- Fetch `getTemplates()` y `getTemplateItems(activeSlug)`
- Renderiza nuevo componente `<TemplateManager />`

📄 **[NEW]** `src/components/calculadora/TemplateManager.js`

Client component que:
1. Muestra pestañas/pills con todos los templates
2. Botón "+ Nueva plantilla" → inline form con nombre → genera slug → `createTemplate()`
3. Botón "Eliminar" (solo para non-default) → `deleteTemplate()`
4. Warning banner indicando qué template se está editando
5. `<CostMatrix />` con `onSave` que llama `saveTemplate(activeSlug, items)`

---

## Paso 8: Build final

```bash
npm run build
```

**Debe compilar sin errores.**

---

## Verificación

| # | Check | Cómo verificar |
|---|-------|----------------|
| 1 | Sim detail | `/calculadora-costos` → guardar simulación → click en ícono 👁 o FOB → se abre `/calculadora-costos/[id]` con desglose completo read-only |
| 2 | Snapshot cards | En la página de detalle, tarjetas FOB/CIF/Base Imponible/Costo Total arriba |
| 3 | Template selector | `/calculadora-costos` → si hay +1 template → barra de selección arriba, cambiar recarga con valores correctos |
| 4 | Config multi | `/calculadora-costos/config` → pestañas de templates, switchear entre ellas |
| 5 | Create template | Config → "Nueva plantilla" → nombre → Crear → nueva pestaña |
| 6 | Delete template | Config → template no-default → "Eliminar" → desaparece |
| 7 | Save template | Config → cambiar % → Guardar → refrescar → persiste |
| 8 | `npm run build` | Sin errores |
