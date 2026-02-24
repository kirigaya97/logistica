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
