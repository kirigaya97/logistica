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
    const totalWeight = items.reduce((sum, i) => sum + (parseFloat(i.weight_kg) || 0), 0)
    const totalVolume = items.reduce((sum, i) => sum + (parseFloat(i.volume_m3) || 0), 0)

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
        .upsert(rows, { onConflict: 'item_id,tag_id' })

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
