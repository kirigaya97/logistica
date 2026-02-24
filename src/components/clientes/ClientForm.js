import Link from 'next/link'

export default function ClientForm({ action, client = null, submitLabel = 'Crear Cliente' }) {
    return (
        <form action={action} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={client?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Nombre del cliente"
                />
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                </label>
                <input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={client?.location || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Ciudad, Provincia"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="international_rate" className="block text-sm font-medium text-gray-700 mb-2">
                        Tarifa Internacional (USD)
                    </label>
                    <input
                        id="international_rate"
                        name="international_rate"
                        type="number"
                        step="0.01"
                        defaultValue={client?.international_rate || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label htmlFor="local_rate" className="block text-sm font-medium text-gray-700 mb-2">
                        Tarifa Local (ARS)
                    </label>
                    <input
                        id="local_rate"
                        name="local_rate"
                        type="number"
                        step="0.01"
                        defaultValue={client?.local_rate || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                    />
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
                    defaultValue={client?.notes || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Notas adicionales..."
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    {submitLabel}
                </button>
                <Link
                    href="/clientes"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    )
}
