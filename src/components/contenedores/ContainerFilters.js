'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CONTAINER_STATES, WAREHOUSES } from '@/lib/constants'

export default function ContainerFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    function handleFilter(key, value) {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/contenedores?${params.toString()}`)
    }

    return (
        <div className="flex gap-4 mb-6">
            <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                value={searchParams.get('status') || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
            >
                <option value="">Todos los estados</option>
                {Object.entries(CONTAINER_STATES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                ))}
            </select>

            <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                value={searchParams.get('origin') || ''}
                onChange={(e) => handleFilter('origin', e.target.value)}
            >
                <option value="">Todos los orígenes</option>
                {Object.entries(WAREHOUSES).map(([key, val]) => (
                    <option key={key} value={key}>{val.flag} {val.label}</option>
                ))}
            </select>
        </div>
    )
}
