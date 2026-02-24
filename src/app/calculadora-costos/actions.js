'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSimulation(name, fobTotal, items) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cost_simulations')
        .insert({
            name,
            fob_total: fobTotal,
            items: items // items is expected to be a JSONB compatible object/array
        })
        .select()
        .single()

    if (error) throw new Error(`Error al guardar simulación: ${error.message}`)

    revalidatePath('/calculadora-costos')
    return data
}

export async function getSimulations() {
    const supabase = await createClient()

    const { data } = await supabase
        .from('cost_simulations')
        .select('*')
        .order('created_at', { ascending: false })

    return data || []
}

export async function deleteSimulation(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cost_simulations')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`Error al eliminar simulación: ${error.message}`)

    revalidatePath('/calculadora-costos')
}

export async function saveDefaultTemplate(items) {
    const supabase = await createClient()

    // 1. Try to find existing default
    const { data: existing } = await supabase
        .from('cost_template_config')
        .select('id')
        .eq('is_default', true)
        .maybeSingle()

    let error;
    if (existing) {
        const { error: err } = await supabase
            .from('cost_template_config')
            .update({
                items: items,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        error = err
    } else {
        const { error: err } = await supabase
            .from('cost_template_config')
            .insert({
                name: 'Default Template',
                is_default: true,
                items: items
            })
        error = err
    }

    if (error) throw new Error(`Error al guardar configuración: ${error.message}`)

    revalidatePath('/calculadora-costos/config')
    revalidatePath('/contenedores') // So new calculations pick up changes
}

export async function getDefaultTemplate() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('cost_template_config')
        .select('items')
        .eq('is_default', true)
        .maybeSingle()

    return data?.items || null
}
