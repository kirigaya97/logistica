'use client'

import { useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import ColumnMapper from '@/components/packing-list/ColumnMapper'
import { parseExcelFile } from '@/lib/excel/parser'
import { importPackingList } from '@/app/contenedores/[id]/packing-list/actions'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

export default function PackingListImporter({ containerId }) {
    const [step, setStep] = useState('upload') // upload | mapping | importing | done
    const [parsed, setParsed] = useState(null)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [fileName, setFileName] = useState('')
    const router = useRouter()

    async function handleFile(file) {
        if (!file) {
            setParsed(null)
            setStep('upload')
            return
        }

        setError(null)
        try {
            const data = await parseExcelFile(file)
            setParsed(data)
            setFileName(file.name)
            setStep('mapping')
        } catch (err) {
            setError(err.message)
        }
    }

    async function handleConfirm(mapping) {
        setStep('importing')
        setError(null)

        try {
            const items = parsed.rows.map(row => ({
                name: mapping.name !== undefined ? String(row[mapping.name] || '') : '',
                quantity: mapping.quantity !== undefined ? row[mapping.quantity] : 1,
                weight_kg: mapping.weight_kg !== undefined ? row[mapping.weight_kg] : null,
                height_cm: mapping.height_cm !== undefined ? row[mapping.height_cm] : null,
                width_cm: mapping.width_cm !== undefined ? row[mapping.width_cm] : null,
                depth_cm: mapping.depth_cm !== undefined ? row[mapping.depth_cm] : null,
                volume_m3: mapping.volume_m3 !== undefined ? row[mapping.volume_m3] : null,
            })).filter(item => item.name.trim() !== '')

            const res = await importPackingList(containerId, fileName, items)
            setResult(res)
            setStep('done')
            router.refresh()
        } catch (err) {
            setError(err.message)
            setStep('mapping')
        }
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {step === 'upload' && (
                <FileUpload onFile={handleFile} label="Arrastrá el packing list en Excel aquí" />
            )}

            {step === 'mapping' && parsed && (
                <ColumnMapper
                    headers={parsed.headers}
                    previewRows={parsed.rows}
                    onConfirm={handleConfirm}
                />
            )}

            {step === 'importing' && (
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-gray-500">Importando items...</p>
                </div>
            )}

            {step === 'done' && result && (
                <div className="bg-green-50 rounded-xl p-8 border border-green-200 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-green-700">
                        ¡{result.count} items importados exitosamente!
                    </p>
                    <button
                        type="button"
                        onClick={() => { setParsed(null); setResult(null); setStep('upload') }}
                        className="mt-4 text-sm text-green-600 hover:underline"
                    >
                        Importar otro archivo
                    </button>
                </div>
            )}
        </div>
    )
}
