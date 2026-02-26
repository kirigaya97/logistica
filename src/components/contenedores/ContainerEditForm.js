'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateContainer } from '@/app/contenedores/actions'
import { WAREHOUSES, CONTAINER_TYPES, WEIGHT_CAPACITIES_TN } from '@/lib/constants'

export default function ContainerEditForm({ container }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleSubmit(formData) {
        setLoading(true)
        setError(null)
        try {
            await updateContainer(container.id, formData)
            // The action already revalidates, we just need to exit edit mode
            const url = new URL(window.location.href)
            url.searchParams.delete('edit')
            router.push(url.pathname)
            router.refresh()
        } catch (e) {
            setError(e.message)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código (Solo lectura)</label>
                    <input
                        type="text"
                        disabled
                        value={container.code}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 capitalize">
                        {container.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="origin_warehouse" className="block text-sm font-medium text-gray-700 mb-2">Origen *</label>
                    <select
                        id="origin_warehouse"
                        name="origin_warehouse"
                        required
                        defaultValue={container.origin_warehouse}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        {Object.entries(WAREHOUSES).map(([key, val]) => (
                            <option key={key} value={key}>{val.flag} {val.label}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="container_type" className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                        <select
                            id="container_type"
                            name="container_type"
                            required
                            defaultValue={container.container_type}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            {Object.entries(CONTAINER_TYPES).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="weight_capacity_tons" className="block text-sm font-medium text-gray-700 mb-2">Peso (TN) *</label>
                        <select
                            id="weight_capacity_tons"
                            name="weight_capacity_tons"
                            required
                            defaultValue={container.weight_capacity_tons || 24}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            {WEIGHT_CAPACITIES_TN.map(tn => (
                                <option key={tn} value={tn}>{tn} TN</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="etd" className="block text-sm font-medium text-gray-700 mb-2">ETD (Salida estimada)</label>
                    <input
                        id="etd"
                        name="etd"
                        type="date"
                        defaultValue={container.etd}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="eta" className="block text-sm font-medium text-gray-700 mb-2">ETA (Arribo estimado)</label>
                    <input
                        id="eta"
                        name="eta"
                        type="date"
                        defaultValue={container.eta}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descripción Corta</label>
                <input
                    id="description"
                    name="description"
                    type="text"
                    defaultValue={container.description || ''}
                    placeholder="Ej: Repuestos varios, Electrónica..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={container.notes || ''}
                    placeholder="Notas adicionales sobre el contenedor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = new URL(window.location.href)
                        url.searchParams.delete('edit')
                        router.push(url.pathname)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
