import { getTagsWithItemCount } from '@/app/etiquetas/actions'
import { deleteTag } from '@/app/etiquetas/actions'
import { Tags, Hash, Trash2 } from 'lucide-react'

export default async function EtiquetasPage() {
    const tags = await getTagsWithItemCount()

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Etiquetas</h1>
                <p className="text-sm text-gray-500">
                    Las etiquetas se crean al clasificar items en los packing lists
                </p>
            </div>

            {tags.length === 0 ? (
                <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                    <Tags className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No hay etiquetas</p>
                    <p className="text-xs text-gray-400">Las etiquetas se crean al clasificar items en los packing lists</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etiqueta</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creada</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map(tag => {
                                const deleteWithId = deleteTag.bind(null, tag.id)
                                return (
                                    <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-800">{tag.name}</span>
                                                <span className="text-xs text-gray-400">({tag.normalized_name})</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {tag.item_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(tag.created_at).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {tag.item_count === 0 && (
                                                <form action={deleteWithId}>
                                                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
