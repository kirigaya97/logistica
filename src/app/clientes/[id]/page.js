import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getClientWithHistory, updateClientAction, deleteClientAction } from '@/app/clientes/actions'
import ClientForm from '@/components/clientes/ClientForm'
import ClientSummary from '@/components/clientes/ClientSummary'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'

export default async function ClientDetailPage({ params, searchParams }) {
    const { id } = await params
    const sp = await searchParams
    const editing = sp?.edit === 'true'

    const client = await getClientWithHistory(id)
    if (!client) notFound()

    const updateAction = updateClientAction.bind(null, id)
    const deleteAction = deleteClientAction.bind(null, id)

    return (
        <div className="max-w-4xl">
            <Link href="/clientes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver a clientes
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{client.name}</h1>
                    {client.location && (
                        <p className="text-gray-500 text-sm mt-1">{client.location}</p>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/clientes/${id}?edit=true`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4" /> Editar
                    </Link>
                    <form action={deleteAction}>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                            Eliminar
                        </button>
                    </form>
                </div>
            </div>

            {/* Info cards */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Tarifa Internacional</p>
                        <p className="font-medium">
                            {client.international_rate ? `USD ${client.international_rate}` : '—'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Tarifa Local</p>
                        <p className="font-medium">
                            {client.local_rate ? `ARS ${client.local_rate}` : '—'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Notas</p>
                        <p className="text-sm text-gray-600">{client.notes || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Edit form or Summary */}
            {editing ? (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Cliente</h2>
                    <ClientForm action={updateAction} client={client} submitLabel="Guardar Cambios" />
                </div>
            ) : (
                <ClientSummary client={client} />
            )}
        </div>
    )
}
