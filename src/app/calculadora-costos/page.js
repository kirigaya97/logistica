import { getSimulations, getTemplates, getTemplateItems } from './actions'
import Simulator from '@/components/calculadora/Simulator'
import { Calculator, Settings } from 'lucide-react'
import { DEFAULT_COST_MATRIX } from '@/lib/calculadora/defaults'
import Link from 'next/link'

export default async function CalculadoraCostosPage({ searchParams }) {
    const { template: templateSlug = 'default' } = await searchParams

    // Parallel fetch for better performance
    const [simulations, templates, templateItems] = await Promise.all([
        getSimulations(),
        getTemplates(),
        getTemplateItems(templateSlug)
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    Simulador de Costos
                </h1>
                <Link
                    href={`/calculadora-costos/config?slug=${templateSlug}`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    <Settings className="w-4 h-4" />
                    Configurar Plantillas
                </Link>
            </div>
            <p className="text-gray-500 text-sm max-w-2xl">
                Simula costos de importación sin vincularlos a un contenedor.
                Las simulaciones se guardan para referencia futura.
                Usá <strong>Configurar Plantillas</strong> para gestionar diferentes perfiles de costos.
            </p>

            <Simulator
                defaultItems={templateItems || DEFAULT_COST_MATRIX}
                initialSimulations={simulations}
                templates={templates}
                activeSlug={templateSlug}
            />
        </div>
    )
}
