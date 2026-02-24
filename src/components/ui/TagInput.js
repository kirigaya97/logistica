'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { searchTags, createTag } from '@/app/etiquetas/actions'

export default function TagInput({ selectedTags = [], onAdd, onRemove }) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 1) {
                setLoading(true)
                const results = await searchTags(query)
                setSuggestions(results.filter(t => !selectedTags.some(st => st.id === t.id)))
                setLoading(false)
                setIsOpen(true)
            } else {
                setSuggestions([])
                setIsOpen(false)
            }
        }, 200)
        return () => clearTimeout(timer)
    }, [query, selectedTags])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)
                && inputRef.current && !inputRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    async function handleSelect(tag) {
        onAdd(tag)
        setQuery('')
        setIsOpen(false)
    }

    async function handleCreate() {
        if (!query.trim()) return
        setLoading(true)
        const tag = await createTag(query.trim())
        onAdd(tag)
        setQuery('')
        setIsOpen(false)
        setLoading(false)
    }

    async function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (suggestions.length > 0) {
                handleSelect(suggestions[0])
            } else if (query.trim()) {
                handleCreate()
            }
        }
    }

    return (
        <div className="space-y-2">
            {/* Selected tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map(tag => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => onRemove(tag)}
                                className="hover:text-blue-900"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 1 && setIsOpen(true)}
                    placeholder="Buscar o crear etiqueta..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />

                {/* Dropdown */}
                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                    >
                        {loading && (
                            <div className="px-3 py-2 text-xs text-gray-400">Buscando...</div>
                        )}

                        {suggestions.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleSelect(tag)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: tag.color || '#6B7280' }}
                                />
                                {tag.name}
                            </button>
                        ))}

                        {!loading && query.trim() && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase()) && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-2 border-t border-gray-100"
                            >
                                <Plus className="w-3 h-3" />
                                Crear "{query.trim()}"
                            </button>
                        )}

                        {!loading && suggestions.length === 0 && !query.trim() && (
                            <div className="px-3 py-2 text-xs text-gray-400">Escribí para buscar</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
