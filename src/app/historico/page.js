import { createClient } from '@/lib/supabase/server'
import { WAREHOUSES, CONTAINER_TYPES } from '@/lib/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import { History, Search, Filter, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function HistoricoPage() {
    const supabase = await createClient()

    const { data: containers, error } = await supabase
        .from('containers')
        .select('*')
        .eq('status', 'finalizado')
        .order('eta', { ascending: false })

    // Stats
    const totalFinalized = containers?.length || 0
    const lastMonth = containers?.filter(c => {
        const eta = new Date(c.eta)
        const now = new Date()
        return eta.getMonth() === now.getMonth() - 1 && eta.getFullYear() === now.getFullYear()
    }).length || 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-600" />
                    Historial de Contenedores
                </h1>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Finalizados</p>
                    <p className="text-2xl font-bold text-gray-800">{totalFinalized}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Finalizados Mes Pasado</p>
                    <p className="text-2xl font-bold text-gray-800">{lastMonth}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Fecha de Hoy</p>
                    <p className="text-lg font-medium text-gray-800"><Calendar className="w-4 h-4 inline mr-2 text-blue-500" /> {new Date().toLocaleDateString('es-AR')}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-bottom border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Origen</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ETA (Arribo)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {containers && containers.length > 0 ? (
                                containers.map(container => {
                                    const warehouse = WAREHOUSES[container.origin_warehouse]
                                    const type = CONTAINER_TYPES[container.container_type]
                                    return (
                                        <tr key={container.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-800">{container.code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span>{warehouse?.flag}</span>
                                                    <span className="text-sm text-gray-600">{warehouse?.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {type?.label}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {container.eta ? new Date(container.eta).toLocaleDateString('es-AR') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">
                                                {container.description || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/contenedores/${container.id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                >
                                                    Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No se encontraron contenedores finalizados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
