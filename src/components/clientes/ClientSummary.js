import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES } from '@/lib/constants'
import { Container, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

export default function ClientSummary({ client }) {
    // Group items by container
    const containerMap = {}
    client.items?.forEach(item => {
        const container = item.packing_lists?.containers
        if (!container) return
        if (!containerMap[container.id]) {
            containerMap[container.id] = {
                ...container,
                items: [],
                totalQty: 0,
                totalWeight: 0,
                totalVolume: 0,
            }
        }
        containerMap[container.id].items.push(item)
        containerMap[container.id].totalQty += item.quantity || 0
        containerMap[container.id].totalWeight += parseFloat(item.weight_kg) || 0
        containerMap[container.id].totalVolume += parseFloat(item.volume_m3) || 0
    })

    const containers = Object.values(containerMap)

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500">Contenedores</p>
                    <p className="text-2xl font-bold text-blue-700">{containers.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500">Items totales</p>
                    <p className="text-2xl font-bold text-green-700">{client.items?.length || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500">Vol. total (m³)</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {containers.reduce((s, c) => s + c.totalVolume, 0).toFixed(4)}
                    </p>
                </div>
            </div>

            {/* Containers list */}
            {containers.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Contenedores asociados</h3>
                    {containers.map(c => {
                        const wh = WAREHOUSES[c.origin_warehouse]
                        return (
                            <Link
                                key={c.id}
                                href={`/contenedores/${c.id}`}
                                className="block bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Container className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-800">{c.code}</p>
                                            <p className="text-xs text-gray-500">
                                                {wh?.flag} {wh?.label} · {c.totalQty} items · {c.totalWeight.toFixed(2)} kg · {c.totalVolume.toFixed(4)} m³
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={c.status} />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-gray-400">No hay contenedores asociados a este cliente.</p>
            )}

            {/* Rate history */}
            {client.rate_history?.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Historial de tarifas</h3>
                    <div className="space-y-2">
                        {client.rate_history.map(entry => (
                            <div key={entry.id} className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500">
                                    {new Date(entry.changed_at).toLocaleDateString('es-AR')}
                                </span>
                                <span className="font-medium capitalize">{entry.rate_type === 'international' ? 'Internacional' : 'Local'}:</span>
                                <span className="text-gray-400">{entry.old_value ?? '—'}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-medium">{entry.new_value ?? '—'}</span>
                                {entry.new_value > entry.old_value ? (
                                    <TrendingUp className="w-3 h-3 text-red-500" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-green-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
