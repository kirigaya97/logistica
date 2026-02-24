'use client'

import { revertContainerStatus } from '@/app/contenedores/actions'
import { Undo2 } from 'lucide-react'
import { useState } from 'react'

export default function RevertStatusButton({ containerId, previousStatus, label }) {
    const [loading, setLoading] = useState(false)

    async function handleRevert() {
        if (!window.confirm(`¿Estás seguro que deseas volver al estado "${label}"?`)) return

        setLoading(true)
        try {
            await revertContainerStatus(containerId, previousStatus)
        } catch (e) {
            alert(e.message)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleRevert}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            title={`Volver a ${label}`}
        >
            <Undo2 className="w-4 h-4" />
            {loading ? 'Revirtiendo...' : `Volver a: ${label}`}
        </button>
    )
}
