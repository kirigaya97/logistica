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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Resultado de Cubicaje</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500">Máx por Volumen</p>
                            <p className="text-lg font-bold text-gray-700">{result.totalBoxes.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{result.boxesLength}x{result.boxesWidth}x{result.boxesHeight}</p>
                        </div>
                        <div className={`rounded-lg p-4 text-center ${result.maxBoxesByWeight < result.totalBoxes ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'}`}>
                            <p className="text-xs text-gray-500">Máx por Peso</p>
                            <p className={`text-lg font-bold ${result.maxBoxesByWeight < result.totalBoxes ? 'text-orange-700' : 'text-gray-700'}`}>
                                {result.maxBoxesByWeight === Infinity ? '∞' : result.maxBoxesByWeight.toLocaleString('es-AR')}
                            </p>
                            {result.maxBoxesByWeight < result.totalBoxes && <p className="text-[10px] text-orange-600 font-medium mt-1">Limitante ⚠️</p>}
                        </div>
                        <div className="bg-blue-600 rounded-lg p-4 text-center text-white shadow-md shadow-blue-100">
                            <p className="text-xs opacity-80">Cajas Efectivas</p>
                            <p className="text-2xl font-bold">{result.effectiveMaxBoxes.toLocaleString('es-AR')}</p>
                        </div>
                        <div className={`rounded-lg p-4 text-center ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="text-xs text-gray-500">Peso Total</p>
                            <p className={`text-lg font-bold ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
                                {result.totalWeight.toLocaleString('es-AR')} kg
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Uso de Volumen</span>
                                <span className="text-xs font-bold text-blue-600">{result.utilizationPct}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(result.utilizationPct, 100)}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">{result.volumeUsedM3} m³ utilizados de {result.containerVolumeM3} m³</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Uso de Peso</span>
                                <span className={`text-xs font-bold ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>{result.weightUtilizationPct}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${result.isValid ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(result.weightUtilizationPct, 100)}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">{result.totalWeight.toLocaleString('es-AR')} kg de {container.maxWeightKg.toLocaleString('es-AR')} kg</p>
                        </div>
                    </div>

                    {!result.isValid && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertTriangle className="w-4 h-4" />
                            <span>El peso total excede el máximo permitido ({container.maxWeightKg.toLocaleString('es-AR')} kg).</span>
                        </div>
                    )}

                    {result.isValid && result.maxBoxesByWeight < result.totalBoxes && (
                        <div className="mt-4 flex items-center gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Configuración válida, pero el peso limita la cantidad de cajas antes que el volumen.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
