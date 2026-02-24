import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getOrCreateCalculation, saveFullCalculation } from './actions'
import CostMatrix from '@/components/calculadora/CostMatrix'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CostosPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: container } = await supabase
        .from('containers')
        .select('id, code, origin_warehouse, container_type')
        .eq('id', id)
        .single()

    if (!container) notFound()

    const calculation = await getOrCreateCalculation(id)

    const handleSave = saveFullCalculation.bind(null, id, calculation.id)

    return (
        <div className="max-w-4xl">
            <Link href={`/contenedores/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver a {container.code}
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Costos — {container.code}</h1>
            <p className="text-gray-500 text-sm mb-6">Calculadora de costos de importación para este contenedor.</p>

            <CostMatrix calculation={calculation} onSave={handleSave} />
        </div>
    )
}
