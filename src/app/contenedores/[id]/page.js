import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES, CONTAINER_TYPES, CONTAINER_STATES } from '@/lib/constants'
import { updateContainerStatus, deleteContainer } from '@/app/contenedores/actions'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Box, DollarSign, FileSpreadsheet, Pencil, Undo2, Users } from 'lucide-react'
import DeleteContainerButton from '@/components/contenedores/DeleteContainerButton'
import ContainerEditForm from '@/components/contenedores/ContainerEditForm'
import RevertStatusButton from '@/components/contenedores/RevertStatusButton'
import ExportButton from '@/components/ui/ExportButton'

const STATE_ORDER = ['deposito', 'transito', 'aduana', 'finalizado']

export default async function ContainerDetailPage({ params, searchParams }) {
    const { id } = await params
    const sp = await searchParams
    const editing = sp?.edit === 'true'
    const supabase = await createClient()

    const { data: container, error } = await supabase
        .from('containers')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !container) notFound()

    // Fetch items with clients for this container
    const { data: items } = await supabase
        .from('packing_list_items')
        .select(`
            id, name, quantity, weight_kg, volume_m3, client_id, 
            clients(name), 
            packing_lists!inner(container_id),
            item_tags(tags(name))
        `)
        .eq('packing_lists.container_id', id)

    // Fetch costs
    const { data: costs } = await supabase
        .from('cost_items')
        .select(`*, cost_calculations!inner(container_id)`)
        .eq('cost_calculations.container_id', id)

    // Full export data
    const fullExportData = {
        container,
        items: items || [],
        costs: costs || []
    }

    // Group items by client
    const customerBoard = {}
    items?.forEach(item => {
        const client = item.clients
        const clientId = item.client_id || 'unassigned'
        const clientName = client?.name || 'No asignado'

        if (!customerBoard[clientId]) {
            customerBoard[clientId] = {
                name: clientName,
                itemCount: 0,
                totalVolume: 0
            }
        }
        customerBoard[clientId].itemCount++
        customerBoard[clientId].totalVolume += parseFloat(item.volume_m3) || 0
    })

    const customers = Object.values(customerBoard).sort((a, b) => b.totalVolume - a.totalVolume)

    const warehouse = WAREHOUSES[container.origin_warehouse]
    const type = CONTAINER_TYPES[container.container_type]
    const currentIdx = STATE_ORDER.indexOf(container.status)
    const nextStatus = STATE_ORDER[currentIdx + 1]
    const nextLabel = nextStatus ? CONTAINER_STATES[nextStatus]?.label : null

    const prevStatus = currentIdx > 0 ? STATE_ORDER[currentIdx - 1] : null
    const prevLabel = prevStatus ? CONTAINER_STATES[prevStatus]?.label : null

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
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/contenedores/${id}?edit=true`}
                            className="p-2 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
                            title="Editar contenedor"
                        >
                            <Pencil className="w-4 h-4" />
                        </Link>
                        <StatusBadge status={container.status} />
                    </div>
                </div>

                {editing ? (
                    <div className="mt-8 border-t border-gray-100 pt-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-blue-600" />
                            Editar Información
                        </h2>
                        <ContainerEditForm container={container} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

                        {customers.length > 0 && (
                            <div className="mb-8 border-t border-gray-100 pt-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Clientes a bordo
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {customers.map((c, idx) => (
                                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-col">
                                            <span className="text-sm font-medium text-gray-800">{c.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {c.itemCount} items · {c.totalVolume.toFixed(3)} m³
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            {prevStatus && (
                                <RevertStatusButton
                                    containerId={id}
                                    previousStatus={prevStatus}
                                    label={prevLabel}
                                />
                            ) || <div className="flex-1" />}

                            {nextStatus && (
                                <form action={updateStatusWithId}>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                        Avanzar a: {nextLabel}
                                    </button>
                                </form>
                            )}
                            <Link
                                href={`/contenedores/${id}/costos`}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <DollarSign className="w-4 h-4" /> Calculadora de Costos
                            </Link>
                            <Link
                                href={`/contenedores/${id}/packing-list`}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" /> Packing List
                            </Link>
                            <ExportButton
                                data={fullExportData}
                                type="container_full"
                                filename={container.code}
                                variant="outline"
                            />
                            <form action={deleteWithId}>
                                <DeleteContainerButton />
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
