import { getTemplates, getTemplateItems } from '../actions'
import TemplateManager from '@/components/calculadora/TemplateManager'
import { Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ConfigPage({ searchParams }) {
    const { slug: activeSlug = 'default' } = await searchParams

    const [templates, activeItems] = await Promise.all([
        getTemplates(),
        getTemplateItems(activeSlug)
    ])

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <Link
                href="/calculadora-costos"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Volver al simulador
            </Link>

            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Gestión de Plantillas
                </h1>
            </div>

            <p className="text-gray-500 text-sm">
                Configurá los diferentes perfiles de costos para aplicar rápidamente en el simulador.
                La <strong>Plantilla Base</strong> se utiliza para nuevos contenedores.
            </p>

            <TemplateManager
                templates={templates}
                activeSlug={activeSlug}
                activeItems={activeItems}
            />
        </div>
    )
}
