import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getPackingList, getItemsWithClassification } from './actions'
import PackingListImporter from '@/components/packing-list/PackingListImporter'
import ItemClassifier from '@/components/packing-list/ItemClassifier'
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
    const classifiedItems = packingList ? await getItemsWithClassification(id) : []

    return (
        <div className="max-w-6xl">
            <Link href={`/contenedores/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver a {container.code}
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Packing List — {container.code}</h1>
                    {packingList && (
                        <p className="text-gray-500 text-sm">
                            {packingList.total_items} items · {packingList.file_name || 'Sin archivo'}
                        </p>
                    )}
                </div>
            </div>

            {/* Importer (always visible to allow re-import) */}
            <div className="mb-8">
                <PackingListImporter containerId={id} />
            </div>

            {/* Classifier Table (replaces the old PackingListTable) */}
            {classifiedItems.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Clasificación de Items</h2>
                    <ItemClassifier items={classifiedItems} containerId={id} />
                </div>
            )}
        </div>
    )
}
