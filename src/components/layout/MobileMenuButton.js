'use client'

import { Menu } from 'lucide-react'
import { useMobileMenu } from './MobileMenuContext'

export default function MobileMenuButton() {
    const { toggle } = useMobileMenu()

    return (
        <button
            onClick={toggle}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
        >
            <Menu className="w-5 h-5" />
        </button>
    )
}
