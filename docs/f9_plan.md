# F9 — Mobile Responsiveness & Hamburger Menu

> ⚠️ Plan para modelo de baja inteligencia. Cada paso es EXACTO.

**Prerequisito**: F8 aplicado ✅

---

## Problema Actual

1. **Sidebar fija**: El `<aside>` usa `fixed left-0 w-64` y el contenido usa `ml-64`. En mobile no hay forma de navegar — la sidebar cubre todo o se corta.
2. **Header sin hamburger**: No hay botón para abrir/cerrar la sidebar en pantallas chicas.
3. **Grids no-responsive**: Varios componentes usan `grid-cols-2` o `grid-cols-4` sin breakpoint prefix (`md:` o `sm:`), lo que rompe en mobile.
4. **Padding excesivo**: `p-8` en `<main>` y `px-8` en `<Header>` son demasiado para pantallas chicas.

---

## Paso 1: Crear `MobileMenuProvider` (contexto global)

📄 **[NEW]** `src/components/layout/MobileMenuContext.js`

```javascript
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
```

---

## Paso 2: Actualizar `Sidebar.js` — Overlay mobile + responsive

📄 `src/components/layout/Sidebar.js`

**Borrar todo y reemplazar con** esta versión que:

1. Importa `useMobileMenu` del contexto
2. Usa `usePathname` para cerrar el menú al navegar
3. En desktop (`lg:` breakpoint) → sidebar fija visible como antes
4. En mobile → overlay a pantalla completa con backdrop oscuro, animación slide-in
5. Al clickear un link o el backdrop → `close()`

```javascript
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
```

---

## Paso 3: Actualizar `Header.js` — Agregar botón hamburger

📄 `src/components/layout/Header.js`

**Borrar todo y reemplazar con**:

```javascript
import { createClient } from '@/lib/supabase/server'
import MobileMenuButton from './MobileMenuButton'

export default async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
                <MobileMenuButton />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">
                    {user?.email}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    )
}
```

**Cambios clave**:
- `px-8` → `px-4 md:px-8`
- Email oculto en mobile (`hidden sm:inline`)
- Se agrega `<MobileMenuButton />` (ver paso 4)

---

## Paso 4: Crear `MobileMenuButton.js`

📄 **[NEW]** `src/components/layout/MobileMenuButton.js`

```javascript
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
```

---

## Paso 5: Actualizar `layout.js` — Responsive main content

📄 `src/app/layout.js`

**Borrar todo y reemplazar con**:

```javascript
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CommandPalette from '@/components/layout/CommandPalette'
import { MobileMenuProvider } from '@/components/layout/MobileMenuContext'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Logística Internacional',
  description: 'Sistema de gestión de logística internacional',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {isAuthenticated ? (
          <MobileMenuProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 lg:ml-64">
                <Header />
                <CommandPalette />
                <main className="p-4 md:p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
                  {children}
                </main>
              </div>
            </div>
          </MobileMenuProvider>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
```

**Cambios clave**:
- `ml-64` → `lg:ml-64` (sin margen en mobile, sidebar es overlay)
- `p-8` → `p-4 md:p-8` (padding reducido en mobile)
- Se wrappea todo con `<MobileMenuProvider>`

---

## Paso 6: Fix grids no-responsive — Todas las páginas afectadas

Estos archivos tienen grids que rompen en mobile. Aplicar los cambios **exactos** listados:

### 6a. `src/components/clientes/ClientSummary.js`

**Buscar**: `grid grid-cols-3 gap-4`
**Reemplazar con**: `grid grid-cols-1 sm:grid-cols-3 gap-4`

### 6b. `src/components/clientes/ClientForm.js`

**Buscar**: `grid grid-cols-2 gap-6`
**Reemplazar con**: `grid grid-cols-1 md:grid-cols-2 gap-6`

### 6c. `src/app/clientes/[id]/page.js`

**Buscar**: `grid grid-cols-2 gap-4`
**Reemplazar con**: `grid grid-cols-1 sm:grid-cols-2 gap-4`

### 6d. `src/app/contenedores/nuevo/page.js`

**Buscar** (2 ocurrencias): `grid grid-cols-2 gap-6`
**Reemplazar ambas con**: `grid grid-cols-1 md:grid-cols-2 gap-6`

### 6e. `src/components/calculadora/VolumetricCalc.js`

**Buscar**: `grid grid-cols-4 gap-4` (la que NO tiene breakpoint prefix)
**Reemplazar con**: `grid grid-cols-2 md:grid-cols-4 gap-4`

### 6f. `src/components/calculadora/ExchangeRateSelector.js`

**Buscar**: `grid grid-cols-2 gap-3`
**Reemplazar con**: `grid grid-cols-1 sm:grid-cols-2 gap-3`

### 6g. `src/app/page.js` (Dashboard)

**Buscar**: `grid grid-cols-1 md:grid-cols-4 gap-6`
**Reemplazar con**: `grid grid-cols-2 md:grid-cols-4 gap-6`

### 6h. `src/app/contenedores/[id]/page.js`

**Buscar**: `grid grid-cols-2 md:grid-cols-4 gap-4 mb-8`
**Reemplazar con**: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8`

### 6i. `src/app/historico/page.js`

**Buscar**: `grid grid-cols-1 md:grid-cols-3 gap-6`
**Reemplazar con**: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6`

---

## Paso 7: Viewport meta tag

📄 `src/app/layout.js`

Verificar que Next.js ya incluye automáticamente `<meta name="viewport" content="width=device-width, initial-scale=1">`. Si **no** está presente en el HTML renderizado, agregar en `metadata`:

```javascript
export const metadata = {
  title: 'Logística Internacional',
  description: 'Sistema de gestión de logística internacional',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}
```

> Next.js 14+ lo incluye automáticamente, así que este paso probablemente no sea necesario.

---

## Paso 8: Fix `CostMatrix.js` — Inputs responsive

📄 `src/components/calculadora/CostMatrix.js`

Las filas de items de costo usan `flex items-center gap-3` que se comprime mucho en mobile. 

**Buscar** el div que wrappea cada item:
```
flex items-center gap-3 py-2 px-3
```

**Reemplazar con**:
```
flex flex-wrap items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3
```

**Buscar** el label `flex-1 text-sm`:
```
flex-1 text-sm text-gray-700
```

**Reemplazar con**:
```
w-full sm:w-auto sm:flex-1 text-sm text-gray-700
```

Esto hace que en mobile el nombre del concepto ocupe una línea completa y los inputs queden debajo.

---

## Paso 9: Build final

```bash
npm run build
```

**Debe compilar sin errores.**

---

## Verificación

| # | Check | Cómo verificar |
|---|-------|----------------|
| 1 | Hamburger visible | Abrir en mobile (o DevTools responsive < 1024px) → botón ☰ visible en header |
| 2 | Menu abre/cierra | Click ☰ → sidebar overlay slide-in → click backdrop o link → cierra |
| 3 | Sidebar hidden mobile | En mobile NO se ve la sidebar fija, solo el overlay al abrir |
| 4 | Sidebar visible desktop | En desktop (>= 1024px) la sidebar se muestra fija como siempre |
| 5 | Dashboard cards | En mobile (< 640px) → las 4 cards del dashboard se muestran en 2 columnas |
| 6 | Grids responsive | Forms y cards no se cortan — stack vertical en pantallas chicas |
| 7 | CostMatrix mobile | Items de costo se leen correctamente sin overflow horizontal |
| 8 | `npm run build` | Sin errores |
