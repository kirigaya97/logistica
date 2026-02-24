import { WAREHOUSES, CONTAINER_TYPES } from '@/lib/constants'
import { createContainer } from '@/app/contenedores/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevoContenedorPage() {
    return (
        <div className="max-w-2xl">
            <Link
                href="/contenedores"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver a contenedores
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Contenedor</h1>

            <form action={createContainer} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="origin_warehouse" className="block text-sm font-medium text-gray-700 mb-2">
                            Depósito de Origen *
                        </label>
                        <select
                            id="origin_warehouse"
                            name="origin_warehouse"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        >
                            {Object.entries(WAREHOUSES).map(([key, val]) => (
                                <option key={key} value={key}>{val.flag} {val.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="container_type" className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Contenedor *
                        </label>
                        <select
                            id="container_type"
                            name="container_type"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        >
                            {Object.entries(CONTAINER_TYPES).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                    </label>
                    <input
                        id="description"
                        name="description"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Ej: Electrónicos varios"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="etd" className="block text-sm font-medium text-gray-700 mb-2">
                            ETD (Salida estimada)
                        </label>
                        <input id="etd" name="etd" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label htmlFor="eta" className="block text-sm font-medium text-gray-700 mb-2">
                            ETA (Arribo estimado)
                        </label>
                        <input id="eta" name="eta" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Notas adicionales..."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        Crear Contenedor
                    </button>
                    <Link
                        href="/contenedores"
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    )
}
