'use client'

import { useExchangeRate } from '@/hooks/useExchangeRate'
import { Banknote, Info } from 'lucide-react'

export default function ExchangeRateSelector({ value, onChange }) {
    const { rates, loading, error } = useExchangeRate()

    const handleSelectChange = (e) => {
        const type = e.target.value
        if (!type) {
            onChange(null)
            return
        }

        if (type === 'custom') {
            onChange({ type: 'custom', rate: value?.rate || 0 })
            return
        }

        const rateObj = rates.find(r => r.casa === type)
        if (rateObj) {
            onChange({ type: rateObj.casa, rate: rateObj.venta })
        }
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-600" />
                Conversión a Pesos (ARS)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                    value={value?.type || ''}
                    onChange={handleSelectChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50"
                >
                    {loading ? (
                        <option>Cargando cotizaciones...</option>
                    ) : error ? (
                        <option>Error al cargar: {error}</option>
                    ) : (
                        <>
                            <option value="">Sin tipo de cambio</option>
                            {rates.map((rate) => (
                                <option key={rate.casa} value={rate.casa}>
                                    {rate.nombre} — $ {rate.venta.toLocaleString('es-AR')} venta
                                </option>
                            ))}
                            <option value="custom">Personalizado</option>
                        </>
                    )}
                </select>

                {value?.type === 'custom' && (
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={value.rate || ''}
                            onChange={(e) => onChange({ type: 'custom', rate: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Ingrese cotización..."
                        />
                    </div>
                )}
            </div>
            
            {!value && !loading && (
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Seleccione una cotización para ver costos proyectados en ARS
                </p>
            )}
        </div>
    )
}
