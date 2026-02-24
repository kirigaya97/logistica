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
