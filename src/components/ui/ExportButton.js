'use client'

import { useState } from 'react'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
import { generateExcel } from '@/lib/utils/excelExport'

export default function ExportButton({ type, data, filename = 'export', label = 'Exportar Excel', variant = 'primary', className = '' }) {
    const [loading, setLoading] = useState(false)

    async function handleExport() {
        setLoading(true)
        try {
            const buffer = await generateExcel(type, data, filename)

            // Trigger download
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (e) {
            console.error(e)
            alert('Error al generar Excel: ' + e.message)
        }
        setLoading(false)
    }

    const variants = {
        primary: 'bg-green-600 text-white hover:bg-green-700',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-500 hover:text-green-600',
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {label}
        </button>
    )
}
