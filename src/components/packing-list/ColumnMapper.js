'use client'

import { useState, useEffect } from 'react'
import { autoDetectMapping } from '@/lib/excel/parser'

const FIELDS = [
    { key: 'name', label: 'Nombre / Descripción', required: true },
    { key: 'quantity', label: 'Cantidad', required: true },
    { key: 'weight_kg', label: 'Peso (kg)', required: false },
    { key: 'height_cm', label: 'Alto (cm)', required: false },
    { key: 'width_cm', label: 'Ancho (cm)', required: false },
    { key: 'depth_cm', label: 'Profundidad (cm)', required: false },
    { key: 'volume_m3', label: 'Volumen (m³)', required: false },
]

export default function ColumnMapper({ headers, previewRows, onConfirm }) {
    const [mapping, setMapping] = useState({})

    useEffect(() => {
        const detected = autoDetectMapping(headers)
        setMapping(detected)
    }, [headers])

    function handleChange(field, colIndex) {
        setMapping(prev => ({
            ...prev,
            [field]: colIndex === '' ? undefined : parseInt(colIndex),
        }))
    }

    const isValid = mapping.name !== undefined && mapping.quantity !== undefined

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Mapeo de Columnas</h3>
                <p className="text-xs text-gray-400 mb-4">
                    Asociá cada campo con la columna correspondiente del Excel. Los campos marcados con * son obligatorios.
                </p>

                <div className="space-y-3">
                    {FIELDS.map(field => (
                        <div key={field.key} className="flex items-center gap-4">
                            <label className="w-48 text-sm text-gray-600">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                value={mapping[field.key] ?? ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">— No mapear —</option>
                                {headers.map((h, i) => (
                                    <option key={i} value={i}>Columna {i + 1}: {h}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview */}
            {previewRows.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm overflow-x-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Preview (primeras 5 filas)</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                {FIELDS.filter(f => mapping[f.key] !== undefined).map(f => (
                                    <th key={f.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewRows.slice(0, 5).map((row, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    {FIELDS.filter(f => mapping[f.key] !== undefined).map(f => (
                                        <td key={f.key} className="px-3 py-2 text-gray-700">
                                            {row[mapping[f.key]] ?? '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button
                type="button"
                onClick={() => onConfirm(mapping)}
                disabled={!isValid}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
                Confirmar Mapeo e Importar ({previewRows.length} filas)
            </button>
        </div>
    )
}
