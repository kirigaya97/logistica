import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, MapPin } from 'lucide-react'

export default async function ClientesPage() {
    const supabase = await createClient()

    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                <Link
                    href="/clientes/nuevo"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Cliente
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    Error al cargar clientes: {error.message}
                </div>
            )}

            {clients && clients.length === 0 && (
                <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No hay clientes</p>
                    <Link
                        href="/clientes/nuevo"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Crear el primero
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients?.map((client) => (
                    <Link
                        key={client.id}
                        href={`/clientes/${client.id}`}
                        className="block bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{client.name}</h3>
                                {client.location && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {client.location}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                            {client.international_rate && (
                                <span>Int: USD {client.international_rate}</span>
                            )}
                            {client.local_rate && (
                                <span>Local: ARS {client.local_rate}</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
