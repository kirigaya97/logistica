import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { WAREHOUSES } from '@/lib/constants'
import { Calendar, MapPin } from 'lucide-react'

export default function ContainerCard({ container }) {
    const warehouse = WAREHOUSES[container.origin_warehouse]

    return (
        <Link
            href={`/contenedores/${container.id}`}
            className="block bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{container.code}</h3>
                <StatusBadge status={container.status} />
            </div>

            <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{warehouse?.flag} {warehouse?.label} — {container.container_type}'</span>
                </div>

                {container.eta && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>ETA: {new Date(container.eta).toLocaleDateString('es-AR')}</span>
                    </div>
                )}

                {container.description && (
                    <p className="text-gray-400 truncate">{container.description}</p>
                )}
            </div>
        </Link>
    )
}
