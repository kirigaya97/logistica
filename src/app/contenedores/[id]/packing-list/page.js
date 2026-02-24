import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getPackingList } from './actions'
import PackingListImporter from '@/components/packing-list/PackingListImporter'
import PackingListTable from '@/components/packing-list/PackingListTable'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'

export default async function PackingListPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: container } = await supabase
        .from('containers')
        .select('id, code')
        .eq('id', id)
        .single()

    if (!container) notFound()

    const packingList = await getPackingList(id)

    return (
        <div className="max-w-5xl">
            <header className="mb-6">
                <Link href={`/contenedores/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver a {container.code}
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Packing List</h1>
                        <p className="text-gray-500 text-sm">Gestioná los items del contenedor {container.code}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* Importer Section */}
                <section>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Importar Items</h2>
                        <PackingListImporter containerId={id} />
                    </div>
                </section>

                {/* Table Section */}
                {packingList && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Contenido del Packing List</h2>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {packingList.packing_list_items?.length || 0} items
                            </span>
                        </div>
                        <PackingListTable
                            items={packingList.packing_list_items}
                            containerId={id}
                        />
                    </section>
                )}
            </div>
        </div>
    )
}
