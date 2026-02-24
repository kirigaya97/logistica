'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TagInput from '@/components/ui/TagInput'
import {
    assignClientToItems,
    addTagToItems,
    removeTagFromItem,
    addManualItem,
    deletePackingListItem,
} from '@/app/contenedores/[id]/packing-list/actions'
import { getClients } from '@/app/clientes/actions'
import { Users, Tags, CheckSquare, Square, Loader2, X, Plus, Trash2, FileSpreadsheet } from 'lucide-react'
import ExportButton from '@/components/ui/ExportButton'

export default function ItemClassifier({ items, containerId }) {
    const [selectedItems, setSelectedItems] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        getClients().then(setClients)
    }, [])

    const [lastSelectedIndex, setLastSelectedIndex] = useState(null)
    const [adding, setAdding] = useState(false)
    const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight_kg: '', volume_m3: '' })

    const allSelected = items.length > 0 && selectedItems.length === items.length
    const someSelected = selectedItems.length > 0

    function toggleItem(id, index, event = null) {
        if (event?.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(index, lastSelectedIndex)
            const end = Math.max(index, lastSelectedIndex)
            const rangeIds = items.slice(start, end + 1).map(i => i.id)

            setSelectedItems(prev => {
                const combined = new Set([...prev, ...rangeIds])
                return Array.from(combined)
            })
        } else {
            setSelectedItems(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )
        }
        setLastSelectedIndex(index)
    }

    function toggleAll() {
        if (allSelected) {
            setSelectedItems([])
            setLastSelectedIndex(null)
        } else {
            setSelectedItems(items.map(i => i.id))
            setLastSelectedIndex(items.length - 1)
        }
    }

    async function handleAssignClient(clientId) {
        if (!someSelected) return
        setLoading(true)
        await assignClientToItems(selectedItems, clientId)
        router.refresh()
        setLoading(false)
    }

    async function handleAddTag(tag) {
        if (!someSelected) return
        setLoading(true)
        await addTagToItems(selectedItems, tag.id)
        router.refresh()
        setLoading(false)
    }

    async function handleRemoveTagFromItem(itemId, tag) {
        setLoading(true)
        await removeTagFromItem(itemId, tag.id)
        router.refresh()
        setLoading(false)
    }

    async function handleAddItem() {
        if (!newItem.name) return
        setLoading(true)
        try {
            await addManualItem(containerId, newItem)
            setNewItem({ name: '', quantity: 1, weight_kg: '', volume_m3: '' })
            setAdding(false)
        } catch (e) {
            alert(e.message)
        }
        setLoading(false)
    }

    async function handleDeleteItem(id) {
        if (!window.confirm('¿Eliminar este item del packing list?')) return
        setLoading(true)
        try {
            await deletePackingListItem(id, containerId)
            setSelectedItems(prev => prev.filter(x => x !== id))
        } catch (e) {
            alert(e.message)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            {/* Bulk actions bar */}
            {someSelected && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-blue-700">
                        {selectedItems.length} item(s) seleccionado(s)
                    </span>

                    {/* Client assignment */}
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <select
                            onChange={(e) => handleAssignClient(e.target.value || null)}
                            className="px-2 py-1 border border-blue-300 rounded-lg text-sm bg-white"
                            defaultValue=""
                        >
                            <option value="">Asignar cliente...</option>
                            <option value="">— Sin cliente —</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tag assignment */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Tags className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                            <TagInput
                                selectedTags={[]}
                                onAdd={handleAddTag}
                                onRemove={() => { }}
                            />
                        </div>
                    </div>

                    {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                </div>
            )}

            {/* Table with checkboxes */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 w-10">
                                    <button type="button" onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                                        {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Peso (kg)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vol (m³)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etiquetas</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    className={`border-b border-gray-100 hover:bg-gray-50 ${selectedItems.includes(item.id) ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={(e) => toggleItem(item.id, idx, e)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {selectedItems.includes(item.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                    <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px] truncate" title={item.name}>
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">{item.weight_kg ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">{item.volume_m3 ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {item.client ? (
                                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                {item.client.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags?.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                                                >
                                                    {tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTagFromItem(item.id, tag)}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </span>
                                            )) || <span className="text-xs text-gray-300">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Inline Manual Form */}
                            {adding ? (
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 text-center">
                                        <Plus className="w-4 h-4 text-blue-500 mx-auto" />
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">+</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            placeholder="Nombre..."
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="w-full px-2 py-1 border rounded text-xs"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                            className="w-16 px-2 py-1 border rounded text-right text-xs ml-auto block"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Peso"
                                            value={newItem.weight_kg}
                                            onChange={(e) => setNewItem({ ...newItem, weight_kg: e.target.value })}
                                            className="w-20 px-2 py-1 border rounded text-right text-xs ml-auto block"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="Vol"
                                            value={newItem.volume_m3}
                                            onChange={(e) => setNewItem({ ...newItem, volume_m3: e.target.value })}
                                            className="w-20 px-2 py-1 border rounded text-right text-xs ml-auto block"
                                        />
                                    </td>
                                    <td colSpan="2" className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddItem}
                                                disabled={loading}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Agregar
                                            </button>
                                            <button
                                                onClick={() => setAdding(false)}
                                                className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-0">
                                        <div className="flex gap-2 justify-center py-3">
                                            <ExportButton
                                                data={items}
                                                type="packing_list"
                                                filename={`packing_list_${containerId}`}
                                                variant="outline"
                                                label="Exportar"
                                            />
                                            <button
                                                onClick={() => setAdding(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Agregar Manual
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
