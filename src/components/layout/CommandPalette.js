'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Container, Users, Tags, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const inputRef = useRef(null)

    // Handle K shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape') setIsOpen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Search logic
    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const supabase = createClient()
        const timeoutId = setTimeout(async () => {
            setLoading(true)

            // Search in multiple tables
            const [contRes, clientRes, tagRes] = await Promise.all([
                supabase.from('containers').select('id, code, description').ilike('code', `%${query}%`).limit(3),
                supabase.from('clients').select('id, name').ilike('name', `%${query}%`).limit(3),
                supabase.from('tags').select('id, name').ilike('name', `%${query}%`).limit(3)
            ])

            const combined = [
                ...(contRes.data || []).map(r => ({ ...r, type: 'container', label: r.code, sub: r.description })),
                ...(clientRes.data || []).map(r => ({ ...r, type: 'client', label: r.name })),
                ...(tagRes.data || []).map(r => ({ ...r, type: 'tag', label: r.name })),
            ]

            setResults(combined)
            setLoading(false)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [query])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-4 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar contenedores, clientes, etiquetas..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {loading && (
                        <div className="p-4 text-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                        </div>
                    )}

                    {!loading && results.length > 0 && results.map((res, idx) => (
                        <button
                            key={`${res.type}-${res.id}`}
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition-colors"
                            onClick={() => {
                                setIsOpen(false)
                                if (res.type === 'container') router.push(`/contenedores/${res.id}`)
                                if (res.type === 'client') router.push(`/clientes/${res.id}`)
                                if (res.type === 'tag') router.push(`/etiquetas`) // Deep links if info exists
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-100 shadow-sm transition-all">
                                    {res.type === 'container' && <Container className="w-4 h-4 text-blue-600" />}
                                    {res.type === 'client' && <Users className="w-4 h-4 text-green-600" />}
                                    {res.type === 'tag' && <Tags className="w-4 h-4 text-orange-600" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{res.label}</p>
                                    {res.sub && <p className="text-xs text-gray-500 truncate w-64">{res.sub}</p>}
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </button>
                    ))}

                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-sm text-gray-400">No se encontraron resultados para "{query}"</p>
                        </div>
                    )}

                    {query.length < 2 && (
                        <div className="p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Accesos rápidos</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => router.push('/contenedores/nuevo')} className="p-3 text-left bg-gray-50 rounded-xl text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">Nuevo Contenedor</button>
                                <button onClick={() => router.push('/clientes/nuevo')} className="p-3 text-left bg-gray-50 rounded-xl text-xs font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">Nuevo Cliente</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
