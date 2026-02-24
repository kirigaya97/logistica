import { createClient } from '@/lib/supabase/server'
import ContainerCard from '@/components/contenedores/ContainerCard'
import ContainerFilters from '@/components/contenedores/ContainerFilters'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import ExportButton from '@/components/ui/ExportButton'

export default async function ContenedoresPage({ searchParams }) {
    const supabase = await createClient()
    const params = await searchParams

    let query = supabase
        .from('containers')
        .select('*')
        .order('created_at', { ascending: false })

    if (params?.status) {
        query = query.eq('status', params.status)
    }
    if (params?.origin) {
        query = query.eq('origin_warehouse', params.origin)
    }

    const { data: containers, error } = await query

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Contenedores</h1>
                <div className="flex items-center gap-3">
                    {containers && containers.length > 0 && (
                        <ExportButton
                            data={containers}
                            type="containers"
                            filename="listado_contenedores"
                            variant="outline"
                        />
                    )}
                    <Link
                        href="/contenedores/nuevo"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo
                    </Link>
                </div>
            </div>

            <Suspense fallback={<div>Cargando filtros...</div>}>
                <ContainerFilters />
            </Suspense>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    Error al cargar contenedores: {error.message}
                </div>
            )}

            {containers && containers.length === 0 && (
                <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                    <p className="text-gray-400 mb-4">No hay contenedores</p>
                    <Link
                        href="/contenedores/nuevo"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Crear el primero
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {containers?.map((container) => (
                    <ContainerCard key={container.id} container={container} />
                ))}
            </div>
        </div>
    )
}
