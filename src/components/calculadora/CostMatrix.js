'use client'

import { useState, useCallback } from 'react'
import { calculateCosts } from '@/lib/calculadora/engine'
import { CATEGORY_LABELS } from '@/lib/calculadora/defaults'
import { DollarSign, Eye, EyeOff, Save, Loader2 } from 'lucide-react'

export default function CostMatrix({ calculation, onSave, readOnly = false }) {
    const [fob, setFob] = useState(calculation?.fob_total || 0)
    const [items, setItems] = useState(
        (calculation?.cost_items || [])
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(item => ({
                ...item,
                isActive: item.is_active,
                valueType: item.value_type,
            }))
    )
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const result = calculateCosts({ fobTotal: fob }, items)

    const updateItem = useCallback((id, field, value) => {
        if (readOnly) return
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
        setIsDirty(true)
    }, [readOnly])

    async function handleSave() {
        if (!onSave || readOnly) return
        setSaving(true)
        try {
            await onSave({ fobTotal: fob, items, result })
            setIsDirty(false)
        } catch (e) {
            alert(e.message)
        }
        setSaving(false)
    }

    // Group items by category
    const grouped = {}
    items.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = []
        grouped[item.category].push(item)
    })

    return (
        <div className="space-y-6 relative">
            {/* FOB Input */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    FOB Total (USD)
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={fob || ''}
                    disabled={readOnly}
                    onChange={(e) => {
                        setFob(parseFloat(e.target.value) || 0)
                        setIsDirty(true)
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-lg font-medium ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="0.00"
                />
            </div>

            {/* Cost categories */}
            {Object.entries(grouped).map(([category, categoryItems]) => (
                <div key={category} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        {CATEGORY_LABELS[category] || category}
                    </h3>
                    <div className="space-y-2">
                        {categoryItems.map(item => {
                            const calculated = result.items.find(i => i.id === item.id)
                            return (
                                <div key={item.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${item.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-50'}`}>
                                    <button
                                        type="button"
                                        disabled={readOnly}
                                        onClick={() => updateItem(item.id, 'isActive', !item.isActive)}
                                        className={`text-gray-400 ${readOnly ? '' : 'hover:text-gray-600'}`}
                                    >
                                        {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        {item.valueType === 'percentage' ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    disabled={readOnly}
                                                    value={item.value || ''}
                                                    onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                                                    className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right ${readOnly ? 'bg-transparent border-transparent' : ''}`}
                                                />
                                                <span className="text-xs text-gray-400">%</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    disabled={readOnly}
                                                    value={item.value || ''}
                                                    onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                                                    className={`w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right ${readOnly ? 'bg-transparent border-transparent' : ''}`}
                                                />
                                            </div>
                                        )}
                                        <span className="w-28 text-right text-sm font-medium text-gray-800">
                                            ${(calculated?.calculatedValue ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Totals */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Resumen</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">FOB</span><span className="font-medium">${result.fobTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CIF</span><span className="font-medium">${result.cif.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Base Imponible</span><span className="font-medium">${result.baseImponible.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Tributos</span><span className="font-medium">${result.totalTributos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Impuestos</span><span className="font-medium">${result.totalImpuestos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Gastos Operativos</span><span className="font-medium">${result.totalGastosOp.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Gastos Externos</span><span className="font-medium">${result.totalGastosExt.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold"><span>COSTO TOTAL</span><span className="text-blue-700">${result.costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                </div>
            </div>

            {/* Save Button Floating */}
            {!readOnly && (
                <div className={`sticky bottom-6 flex justify-end transition-all pb-4 ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 flex items-center gap-2 font-semibold border-2 border-white"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            )}
        </div>
    )
}
