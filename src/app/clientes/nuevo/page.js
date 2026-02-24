import { createClientAction } from '@/app/clientes/actions'
import ClientForm from '@/components/clientes/ClientForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevoClientePage() {
    return (
        <div className="max-w-2xl">
            <Link
                href="/clientes"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver a clientes
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Cliente</h1>
            <ClientForm action={createClientAction} />
        </div>
    )
}
