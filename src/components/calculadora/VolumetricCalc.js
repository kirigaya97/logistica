'use client'

import { useState } from 'react'
import { CONTAINER_TYPES } from '@/lib/constants'
import { calculateVolumetric } from '@/lib/calculadora/volumetric'
import { Box, AlertTriangle, CheckCircle } from 'lucide-react'

export default function VolumetricCalc() {
    const [containerType, setContainerType] = useState('40HC')
    const [box, setBox] = useState({ lengthCm: 0, widthCm: 0, heightCm: 0, weightKg: 0 })

    const container = CONTAINER_TYPES[containerType]
    const result = calculateVolumetric(container, box)

    function handleBoxChange(field, value) {
        setBox(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
    }

    return (
        <div className="space-y-6">
            {/* Container Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contenedor</label>
                <div className="flex gap-3">
                    {Object.entries(CONTAINER_TYPES).map(([key, val]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setContainerType(key)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${containerType === key
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Interior: {container.lengthCm}×{container.widthCm}×{container.heightCm} cm — Peso máx: {container.maxWeightKg.toLocaleString('es-AR')} kg
                </p>
            </div>

            {/* Box dimensions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Dimensiones de la caja
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Largo (cm)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={box.lengthCm || ''}
                            onChange={(e) => handleBoxChange('lengthCm', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Ancho (cm)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={box.widthCm || ''}
                            onChange={(e) => handleBoxChange('widthCm', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Alto (cm)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={box.heightCm || ''}
                            onChange={(e) => handleBoxChange('heightCm', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={box.weightKg || ''}
                            onChange={(e) => handleBoxChange('weightKg', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && result.totalBoxes > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Resultado</h3>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500">Distribución</p>
                            <p className="text-sm font-medium mt-1">{result.boxesLength} × {result.boxesWidth} × {result.boxesHeight}</p>
                            <p className="text-xs text-gray-400">(L × A × H)</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500">Total de cajas</p>
                            <p className="text-2xl font-bold text-blue-700">{result.totalBoxes.toLocaleString('es-AR')}</p>
                        </div>
                        <div className={`rounded-lg p-4 text-center ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="text-xs text-gray-500">Peso total</p>
                            <p className={`text-lg font-bold ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
                                {result.totalWeight.toLocaleString('es-AR')} kg
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Volumen utilizado</p>
                            <p className="text-sm font-medium">{result.volumeUsedM3} m³ / {result.containerVolumeM3} m³ ({result.utilizationPct}%)</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Peso utilizado</p>
                            <p className="text-sm font-medium">{result.totalWeight.toLocaleString('es-AR')} / {container.maxWeightKg.toLocaleString('es-AR')} kg ({result.weightUtilizationPct}%)</p>
                        </div>
                    </div>

                    {!result.isValid && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            <span>⚠️ El peso total excede el máximo permitido del contenedor.</span>
                        </div>
                    )}

                    {result.isValid && (
                        <div className="mt-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span>✅ Configuración válida. Peso dentro del límite.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
