'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CostMatrix from './CostMatrix'
import { saveTemplate, createTemplate, deleteTemplate } from '@/app/calculadora-costos/actions'
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { DEFAULT_COST_MATRIX } from '@/lib/calculadora/defaults'

export default function TemplateManager({ templates, activeSlug, activeItems }) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [loading, setLoading] = useState(false)

    const activeTemplate = templates.find(t => t.slug === activeSlug) || templates[0]

    async function handleSaveTemplate({ items }) {
        await saveTemplate(activeSlug, items)
    }

    async function handleCreate() {
        if (!newName) return
        setLoading(true)
        try {
            const slug = newName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '')
            await createTemplate(newName, slug, activeItems || DEFAULT_COST_MATRIX)
            setNewName('')
            setIsCreating(false)
            router.push(`/calculadora-costos/config?slug=${slug}`)
        } catch (e) {
            alert(e.message)
        }
        setLoading(false)
    }

    async function handleDelete(slug) {
        if (!window.confirm('¿Eliminar esta plantilla? Esta acción no se puede deshacer.')) return
        try {
            await deleteTemplate(slug)
            router.push('/calculadora-costos/config?slug=default')
        } catch (e) {
            alert(e.message)
        }
    }

    const mockCalculation = {
        fob_total: 1000,
        cost_items: (activeItems || DEFAULT_COST_MATRIX).map((it, idx) => ({
            ...it,
            id: it.id || `tpl-${idx}`,
            value_type: it.value_type || it.valueType,
            is_active: it.isActive ?? it.is_active
        }))
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {templates.map(t => (
                    <div key={t.slug} className="flex items-center gap-1 group">
                        <button
                            onClick={() => router.push(`/calculadora-costos/config?slug=${t.slug}`)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSlug === t.slug
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {t.name}
                        </button>
                        {!t.is_default && activeSlug === t.slug && (
                            <button
                                onClick={() => handleDelete(t.slug)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Eliminar plantilla"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {isCreating ? (
                    <div className="flex items-center gap-2 bg-white p-1 pr-2 border border-blue-200 rounded-lg shadow-sm">
                        <input
                            type="text"
                            autoFocus
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nombre de plantilla"
                            className="px-2 py-1 text-sm outline-none w-40"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Nueva
                    </button>
                )}
            </div>

            {/* Warning Banner */}
            <div className={`p-4 rounded-xl border flex gap-4 ${activeTemplate?.is_default ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                <AlertCircle className={`w-5 h-5 shrink-0 ${activeTemplate?.is_default ? 'text-amber-600' : 'text-blue-600'}`} />
                <div>
                    <h3 className={`font-bold text-sm mb-1 ${activeTemplate?.is_default ? 'text-amber-800' : 'text-blue-800'}`}>
                        Editando: {activeTemplate?.name}
                    </h3>
                    <p className={`text-xs leading-relaxed ${activeTemplate?.is_default ? 'text-amber-700' : 'text-blue-700'}`}>
                        {activeTemplate?.is_default
                            ? 'Esta plantilla es la base global para nuevos contenedores y simulaciones por defecto.'
                            : 'Esta es una configuración alternativa. Podrá seleccionarla en el simulador.'}
                    </p>
                </div>
            </div>

            <CostMatrix
                key={activeSlug}
                calculation={mockCalculation}
                onSave={handleSaveTemplate}
            />
        </div>
    )
}
