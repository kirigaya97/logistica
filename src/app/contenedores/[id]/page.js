import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES, CONTAINER_TYPES, CONTAINER_STATES } from '@/lib/constants'
import { updateContainerStatus, deleteContainer } from '@/app/contenedores/actions'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Box } from 'lucide-react'

const STATE_ORDER = ['deposito', 'transito', 'aduana', 'finalizado']

export default async function ContainerDetailPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: container, error } = await supabase
        .from('containers')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !container) notFound()

    const warehouse = WAREHOUSES[container.origin_warehouse]
    const type = CONTAINER_TYPES[container.container_type]
    const currentIdx = STATE_ORDER.indexOf(container.status)
    const nextStatus = STATE_ORDER[currentIdx + 1]
    const nextLabel = nextStatus ? CONTAINER_STATES[nextStatus]?.label : null

    const updateStatusWithId = updateContainerStatus.bind(null, id, nextStatus)
    const deleteWithId = deleteContainer.bind(null, id)

    return (
        <div className="max-w-4xl">
            <Link href="/contenedores" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver
            </Link>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{container.code}</h1>
                        <p className="text-gray-500 text-sm mt-1">{container.description || 'Sin descripción'}</p>
                    </div>
                    <StatusBadge status={container.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Origen</p>
                        <p className="font-medium"><MapPin className="w-4 h-4 inline mr-1" />{warehouse?.flag} {warehouse?.label}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Tipo</p>
                        <p className="font-medium"><Box className="w-4 h-4 inline mr-1" />{type?.label}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">ETD</p>
                        <p className="font-medium"><Calendar className="w-4 h-4 inline mr-1" />{container.etd ? new Date(container.etd).toLocaleDateString('es-AR') : '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">ETA</p>
                        <p className="font-medium"><Calendar className="w-4 h-4 inline mr-1" />{container.eta ? new Date(container.eta).toLocaleDateString('es-AR') : '—'}</p>
                    </div>
                </div>

                {container.notes && (
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Notas</h3>
                        <p className="text-gray-500 text-sm bg-gray-50 rounded-lg p-4">{container.notes}</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {nextStatus && (
                        <form action={updateStatusWithId}>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Avanzar a: {nextLabel}
                            </button>
                        </form>
                    )}
                    <form action={deleteWithId}>
                        <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                            Eliminar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
