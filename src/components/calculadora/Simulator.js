'use client'

import { useState } from 'react'
import CostMatrix from './CostMatrix'
import { saveSimulation, deleteSimulation } from '@/app/calculadora-costos/actions'
import { Calculator, Save, History, Trash2, FileSpreadsheet, Loader2 } from 'lucide-react'
import ExportButton from '@/components/ui/ExportButton'

export default function Simulator({ defaultItems, initialSimulations }) {
    const [simulations, setSimulations] = useState(initialSimulations || [])
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSave({ fobTotal, items }) {
        const simName = name || `Simulación ${new Date().toLocaleDateString()}`
        setSaving(true)
        try {
            const newSim = await saveSimulation(simName, fobTotal, items)
            setSimulations([newSim, ...simulations])
            setName('')
        } catch (e) {
            alert(e.message)
        }
        setSaving(false)
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Eliminar esta simulación?')) return
        try {
            await deleteSimulation(id)
            setSimulations(simulations.filter(s => s.id !== id))
        } catch (e) {
            alert(e.message)
        }
    }

    // Mock "calculation" object for CostMatrix
    const mockCalculation = {
        fob_total: 0,
        cost_items: defaultItems.map((it, idx) => ({ ...it, id: it.id || `temp-${idx}`, value_type: it.valueType || it.value_type, is_active: it.isActive }))
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre de la simulación</label>
                        {saving && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Importación Electronica Q3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <CostMatrix
                    calculation={mockCalculation}
                    onSave={handleSave}
                />
            </div>

            {/* Sidebar: History */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-fit">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-blue-600" />
                        Simulaciones Guardadas
                    </h3>

                    <div className="space-y-3">
                        {simulations.length > 0 ? (
                            simulations.map(sim => (
                                <div key={sim.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-medium text-gray-800">{sim.name}</p>
                                        <button
                                            onClick={() => handleDelete(sim.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-gray-400">{new Date(sim.created_at).toLocaleDateString()}</span>
                                        <span className="text-sm font-bold text-gray-700">${sim.fob_total?.toLocaleString()} FOB</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-4">No hay simulaciones guardadas</p>
                        )}
                    </div>

                    {simulations.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <ExportButton
                                data={simulations}
                                filename="simulaciones_costos"
                                type="simulations"
                                label="Exportar Historial"
                                variant="outline"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
