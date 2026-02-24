'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const MobileMenuContext = createContext()

export function MobileMenuProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false)
    const toggle = useCallback(() => setIsOpen(prev => !prev), [])
    const close = useCallback(() => setIsOpen(false), [])

    return (
        <MobileMenuContext.Provider value={{ isOpen, toggle, close }}>
            {children}
        </MobileMenuContext.Provider>
    )
}

export function useMobileMenu() {
    return useContext(MobileMenuContext)
}
