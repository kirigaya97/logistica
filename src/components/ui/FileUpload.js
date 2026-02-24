'use client'

import { useState, useRef } from 'react'
import { Upload, File, X } from 'lucide-react'

export default function FileUpload({ onFile, accept = '.xlsx,.xls', label = 'Arrastrá un archivo aquí' }) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState(null)
    const inputRef = useRef(null)

    function handleDragOver(e) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(e) {
        e.preventDefault()
        setIsDragging(false)
    }

    function handleDrop(e) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processFile(file)
    }

    function handleChange(e) {
        const file = e.target.files[0]
        if (file) processFile(file)
    }

    function processFile(file) {
        setFileName(file.name)
        onFile(file)
    }

    function handleClear() {
        setFileName(null)
        if (inputRef.current) inputRef.current.value = ''
        onFile(null)
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : fileName
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {fileName ? (
                <div className="flex items-center justify-center gap-3">
                    <File className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{fileName}</span>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleClear() }}
                        className="p-1 rounded-full hover:bg-green-100"
                    >
                        <X className="w-4 h-4 text-green-600" />
                    </button>
                </div>
            ) : (
                <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-xs text-gray-400 mt-1">Formatos: .xlsx, .xls</p>
                </div>
            )}
        </div>
    )
}
