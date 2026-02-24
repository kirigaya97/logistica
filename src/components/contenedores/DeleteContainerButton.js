'use client'

export default function DeleteContainerButton() {
    return (
        <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            onClick={(e) => {
                if (!confirm('¿Estás seguro de que querés eliminar este contenedor y todos sus cálculos asociados?')) {
                    e.preventDefault()
                }
            }}
        >
            Eliminar
        </button>
    )
}
