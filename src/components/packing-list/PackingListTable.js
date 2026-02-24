'use client'

import { Trash2 } from 'lucide-react'
import { deletePackingListItem } from '@/app/contenedores/[id]/packing-list/actions'
import { useRouter } from 'next/navigation'

export default function PackingListTable({ items = [], containerId }) {
    const router = useRouter()

    async function handleDelete(itemId) {
        if (!confirm('¿Eliminar este item?')) return
        await deletePackingListItem(itemId, containerId)
        router.refresh()
    }

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
                <p className="text-sm text-gray-400">No hay items en el packing list.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Peso (kg)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alto</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ancho</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prof.</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vol (m³)</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items
                            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                            .map((item, idx) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                    <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">{item.weight_kg ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{item.height_cm ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{item.width_cm ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{item.depth_cm ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{item.volume_m3 ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 font-medium">
                            <td className="px-4 py-3" colSpan={2}>Total</td>
                            <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + (i.quantity || 0), 0)}</td>
                            <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + (i.weight_kg || 0), 0).toFixed(2)}</td>
                            <td className="px-4 py-3" colSpan={3}></td>
                            <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + (i.volume_m3 || 0), 0).toFixed(4)}</td>
                            <td className="px-4 py-3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
