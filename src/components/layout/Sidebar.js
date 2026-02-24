'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Container, Users, Tags, Box, Archive,
    LogOut, Ship, Calculator, X
} from 'lucide-react'
import { NAV_GROUPS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useMobileMenu } from './MobileMenuContext'

const iconMap = {
    LayoutDashboard, Container, Users, Tags, Box, Archive, Calculator
}

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { isOpen, close } = useMobileMenu()
    const [counts, setCounts] = useState({ activeContainers: 0 })

    useEffect(() => {
        const supabase = createClient()
        async function fetchCounts() {
            const { count } = await supabase
                .from('containers')
                .select('*', { count: 'exact', head: true })
                .neq('status', 'finalizado')
            setCounts({ activeContainers: count || 0 })
        }
        fetchCounts()
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        close()
    }, [pathname, close])

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Ship className="w-8 h-8 text-blue-400" />
                    <div>
                        <h1 className="text-lg font-bold">Logística</h1>
                        <p className="text-xs text-gray-400">Internacional</p>
                    </div>
                </div>
                {/* Close button — mobile only */}
                <button
                    onClick={close}
                    className="lg:hidden p-2 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                {NAV_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-1">
                        <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            {group.title}
                        </h3>
                        {group.items.map((item) => {
                            const Icon = iconMap[item.icon]
                            const isActive = pathname === item.href
                            const showBadge = item.href === '/contenedores' && counts.activeContainers > 0

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {Icon && <Icon className="w-4 h-4" />}
                                        {item.label}
                                    </div>
                                    {showBadge && (
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-blue-400 text-white' : 'bg-blue-900 text-blue-300'}`}>
                                            {counts.activeContainers}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar — always visible on lg+ */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex-col z-30">
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={close}
                    />
                    {/* Slide-in sidebar */}
                    <aside className="relative w-72 h-full bg-gray-900 text-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    )
}
