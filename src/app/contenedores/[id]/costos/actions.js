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
        .single()

    if (existing) return existing

    // Create new with defaults
    const { data: calc, error: calcError } = await supabase
        .from('cost_calculations')
        .insert({ container_id: containerId })
        .select()
        .single()

    if (calcError) throw new Error(`Error al crear cálculo: ${calcError.message}`)

    // Insert default items
    const defaultItems = DEFAULT_COST_MATRIX.map((item, idx) => ({
        calculation_id: calc.id,
        category: item.category,
        name: item.name,
        value_type: item.valueType,
        base: item.base,
        value: item.value,
        is_active: item.isActive,
        sort_order: item.sortOrder || idx,
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

export async function updateCostItem(itemId, updates) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cost_items')
        .update(updates)
        .eq('id', itemId)

    if (error) throw new Error(`Error al actualizar: ${error.message}`)
}

export async function updateCalculation(calcId, updates, containerId) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cost_calculations')
        .update(updates)
        .eq('id', calcId)

    if (error) throw new Error(`Error al actualizar cálculo: ${error.message}`)
    revalidatePath(`/contenedores/${containerId}/costos`)
}

export async function saveBatchCostItems(items) {
    const supabase = await createClient()

    for (const item of items) {
        const { id, ...updates } = item
        await supabase.from('cost_items').update(updates).eq('id', id)
    }
}
