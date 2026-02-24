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

    // Get items assigned to this client (including tags)
    const { data: itemData } = await supabase
        .from('packing_list_items')
        .select(`
            id, name, quantity, weight_kg, volume_m3,
            packing_lists!inner(
                id, container_id,
                containers!inner(id, code, status, origin_warehouse, eta, etd)
            ),
            item_tags(tags(id, name))
        `)
        .eq('client_id', id)

    const items = itemData || []

    // Calculate stats
    const uniqueContainers = new Set()
    const uniqueTags = new Set()
    let totalVolume = 0
    let totalWeight = 0

    items.forEach(item => {
        const container = item.packing_lists?.containers
        if (container) uniqueContainers.add(container.code)

        totalVolume += parseFloat(item.volume_m3) || 0
        totalWeight += parseFloat(item.weight_kg) || 0

        item.item_tags?.forEach(it => {
            if (it.tags) uniqueTags.add(it.tags.name)
        })
    })

    return {
        ...client,
        rate_history: rateHistory || [],
        items: items,
        stats: {
            containerCount: uniqueContainers.size,
            uniqueContainers: Array.from(uniqueContainers),
            totalVolume,
            totalWeight,
            uniqueTags: Array.from(uniqueTags)
        }
    }
}
