'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DEFAULT_COST_MATRIX } from '@/lib/calculadora/defaults'

export async function getOrCreateCalculation(containerId) {
    const supabase = await createClient()

    // Try to get existing
    const { data: existing } = await supabase
        .from('cost_calculations')
        .select('*, cost_items(*)')
        .eq('container_id', containerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (existing) return existing

    // Create new with defaults
    const { data: calc, error: calcError } = await supabase
        .from('cost_calculations')
        .insert({ container_id: containerId })
        .select()
        .single()

    if (calcError) throw new Error(`Error al crear cálculo: ${calcError.message}`)

    // 1. Try to get template from DB
    const { data: template } = await supabase
        .from('cost_template_config')
        .select('items')
        .eq('is_default', true)
        .maybeSingle()

    const templateItems = template?.items || DEFAULT_COST_MATRIX

    // 2. Insert items
    const defaultItems = templateItems.map((item, idx) => ({
        calculation_id: calc.id,
        category: item.category,
        name: item.name,
        value_type: item.value_type || item.valueType,
        base: item.base,
        value: item.value,
        is_active: item.isActive,
        sort_order: item.sort_order ?? item.sortOrder ?? idx,
    }))

    const { error: itemsError } = await supabase
        .from('cost_items')
        .insert(defaultItems)

    if (itemsError) throw new Error(`Error al crear items: ${itemsError.message}`)

    // Return the full calculation
    const { data: full } = await supabase
        .from('cost_calculations')
        .select('*, cost_items(*)')
        .eq('id', calc.id)
        .single()

    return full
}

export async function saveFullCalculation(containerId, calcId, { fobTotal, items }) {
    const supabase = await createClient()

    // 1. Update FOB in calculation
    const { error: calcError } = await supabase
        .from('cost_calculations')
        .update({ fob_total: fobTotal })
        .eq('id', calcId)

    if (calcError) throw new Error(`Error al guardar totales: ${calcError.message}`)

    // 2. Update items (using Promise.all for speed)
    const updates = items.map(item => {
        const { id, isActive, value } = item
        return supabase
            .from('cost_items')
            .update({
                is_active: isActive,
                value
            })
            .eq('id', id)
    })

    await Promise.all(updates)

    revalidatePath(`/contenedores/${containerId}/costos`)
}
