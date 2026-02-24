import { getDefaultTemplate, saveDefaultTemplate } from '../actions'
import { DEFAULT_COST_MATRIX } from '@/lib/calculadora/defaults'
import CostMatrix from '@/components/calculadora/CostMatrix'
import { Settings, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ConfigPage() {
    const templateItems = await getDefaultTemplate()
    const currentItems = templateItems || DEFAULT_COST_MATRIX

    const handleSave = async ({ items }) => {
        'use server'
        // We only save the template structure/values, ignoring global FOB
        await saveDefaultTemplate(items)
    }

    const mockCalculation = {
        fob_total: 1000, // Fixed for preview
        cost_items: currentItems.map((it, idx) => ({
            ...it,
            id: it.id || `tpl-${idx}`,
            value_type: it.value_type || it.valueType,
            is_active: it.isActive
        }))
    }

    return (
        <div className="max-w-4xl space-y-6">
            <Link href="/calculadora-costos" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Volver al simulador
            </Link>

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Configuración de Plantilla
                </h1>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                    <h3 className="text-amber-800 font-bold mb-1">Aviso Importante</h3>
                    <p className="text-amber-700 text-sm leading-relaxed">
                        Los cambios realizados aquí afectarán a <strong>todos los nuevos contenedores</strong> que se creen a partir de ahora.
                        No modificará contenedores existentes ni simulaciones guardadas anteriormente.
                    </p>
                </div>
            </div>

            <p className="text-gray-600 text-sm italic py-2">
                * Ajusta los valores porcentuales o fijos que se aplicarán por defecto como base de cálculo.
            </p>

            <CostMatrix
                calculation={mockCalculation}
                onSave={handleSave}
            />
        </div>
    )
}
