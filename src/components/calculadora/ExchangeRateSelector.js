'use client'

import { useExchangeRate } from '@/hooks/useExchangeRate'

const RATE_LABELS = {
    blue: '💵 Dólar Blue',
    oficial: '🏛️ Dólar Oficial',
    bolsa: '📈 Dólar Bolsa (MEP)',
    contadoconliqui: '💱 Dólar CCL',
}

export default function ExchangeRateSelector({ value, onChange }) {
    const { rates, loading, error } = useExchangeRate()

    if (loading) return <p className="text-sm text-gray-400">Cargando cotizaciones...</p>
    if (error) return <p className="text-sm text-red-400">Error: {error}</p>

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Tipo de Cambio</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rates.map((rate) => {
                    const label = RATE_LABELS[rate.casa] || rate.nombre
                    const isSelected = value?.type === rate.casa
                    return (
                        <button
                            key={rate.casa}
                            type="button"
                            onClick={() => onChange({ type: rate.casa, buy: rate.compra, sell: rate.venta })}
                            className={`p-3 rounded-lg border text-left text-sm transition-all ${isSelected
                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <p className="font-medium">{label}</p>
                            <p className="text-gray-500 text-xs mt-1">
                                Compra: ${rate.compra?.toLocaleString('es-AR')} — Venta: ${rate.venta?.toLocaleString('es-AR')}
                            </p>
                        </button>
                    )
                })}
            </div>

            {value && (
                <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Override manual (opcional)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={value.sell || ''}
                        onChange={(e) => onChange({ ...value, sell: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Valor manual..."
                    />
                </div>
            )}
        </div>
    )
}
