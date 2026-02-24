import { getSimulation } from '@/app/calculadora-costos/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CostMatrix from '@/components/calculadora/CostMatrix'
import { ChevronLeft, DollarSign, Package, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react'

export default async function SimulationDetailPage({ params }) {
    const { id } = await params
    let simulation;

    try {
        simulation = await getSimulation(id)
    } catch (e) {
        redirect('/calculadora-costos')
    }

    if (!simulation.snapshot) {
        redirect('/calculadora-costos')
    }

    const { snapshot } = simulation

    const summaryCards = [
        { label: 'FOB Total', value: snapshot.fobTotal, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Valor CIF', value: snapshot.cif, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Base Imponible', value: snapshot.baseImponible, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Costo Total', value: snapshot.costoTotal, icon: CreditCard, color: 'text-blue-700', bg: 'bg-blue-100 font-bold' },
    ]

    const mockCalculation = {
        fob_total: snapshot.fobTotal,
        cost_items: simulation.items.map((it, idx) => ({
            ...it,
            id: it.id || `saved-${idx}`,
            value_type: it.value_type,
            is_active: it.is_active
        }))
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link
                        href="/calculadora-costos"
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver al simulador
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{simulation.name}</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Cerrado el {new Date(simulation.created_at).toLocaleString('es-AR')}
                    </p>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className={`${card.bg} rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4`}>
                        <div className={`p-2 rounded-lg bg-white ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{card.label}</p>
                            <p className={`text-lg ${card.color}`}>
                                ${card.value?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Desglose Detallado</h2>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                            Modo Lectura
                        </span>
                    </div>
                    <CostMatrix
                        calculation={mockCalculation}
                        readOnly={true}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Información de la Simulación</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tributos</label>
                                <p className="text-sm font-medium text-gray-700">${snapshot.totalTributos?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Impuestos</label>
                                <p className="text-sm font-medium text-gray-700">${snapshot.totalImpuestos?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gastos Operativos</label>
                                <p className="text-sm font-medium text-gray-700">${snapshot.totalGastosOp?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gastos Externos</label>
                                <p className="text-sm font-medium text-gray-700">${snapshot.totalGastosExt?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Acciones
                        </h3>
                        <p className="text-xs text-blue-600 mb-4">
                            Esta es una captura histórica. Para realizar cambios, cree una nueva simulación en el panel principal.
                        </p>
                        <Link
                            href="/calculadora-costos"
                            className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Nueva Simulación
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
