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

export async function revertContainerStatus(id, previousStatus) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('containers')
        .update({ status: previousStatus })
        .eq('id', id)

    if (error) throw new Error(`Error al revertir estado: ${error.message}`)
    revalidatePath('/contenedores')
    revalidatePath(`/contenedores/${id}`)
}

export async function updateContainer(id, formData) {
    const supabase = await createClient()
    const raw = Object.fromEntries(formData)

    // We reuse the schema but allow partial updates for the form
    const parsed = containerSchema.partial().parse(raw)

    const { error } = await supabase
        .from('containers')
        .update(parsed)
        .eq('id', id)

    if (error) throw new Error(`Error al actualizar contenedor: ${error.message}`)

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
