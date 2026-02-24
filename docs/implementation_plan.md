# Plan de Implementación Detallado

> ⚠️ Este plan está diseñado para ser ejecutado por un modelo de baja inteligencia.
> Cada paso es EXACTO. No improvisar. No saltear pasos. No agregar código extra.

---

## Reglas para el ejecutor

1. **Leer AI_ROUTER.md** antes de cada feature
2. **Leer los SKILL.md** relevantes antes de cada feature (indicados en cada sección)
3. **No instalar paquetes** que no se indiquen explícitamente
4. **No crear archivos** que no se indiquen explícitamente
5. **Correr `npm run build`** después de cada feature completa
6. **Hacer git commit** después de cada feature completa
7. **Correr `npm run map:full`** después de cada commit (o dejar que el hook lo haga)
8. **No modificar archivos de otros features** a menos que se indique
9. Idioma de la UI: **español**. Idioma del código: **inglés**
10. Usar **Tailwind CSS** para estilos (ya instalado, v4)

---

## PREREQUISITO: Crear proyecto Supabase

Antes de empezar Feature 1.1, el USUARIO debe:

1. Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Nombre: `logistica`
4. Región: la más cercana (South America si disponible)
5. Generar password segura y guardarla
6. Una vez creado, ir a Settings → API y copiar:
   - **Project URL** (ejemplo: `https://xxxx.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)
7. Crear archivo `.env.local` en la raíz del proyecto con este contenido exacto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu_anon_key_aqui
```

> [!CAUTION]
> Sin este paso, NADA funciona. El ejecutor debe confirmar que `.env.local` existe antes de continuar.

---

## F1.1 — Auth + Layout Base

**Skills a leer antes**: `.agents/skills/supabase-patterns/SKILL.md`  
**Instalar**: `@supabase/ssr`, `zod`, `lucide-react`

### Paso 1: Instalar dependencias

```bash
npm install @supabase/ssr zod lucide-react
```

**Verificar**: `package.json` debe tener `@supabase/ssr`, `zod`, `lucide-react` en `dependencies`.

---

### Paso 2: Crear tabla profiles en Supabase

Crear archivo:  
📄 `supabase/migrations/001_profiles.sql`

```sql
-- Tabla de perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Acción**: Copiar este SQL y ejecutarlo en el SQL Editor del dashboard de Supabase.

---

### Paso 3: Crear Supabase clients

Crear archivo:  
📄 `src/lib/supabase/client.js`

```javascript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

Crear archivo:  
📄 `src/lib/supabase/server.js`

```javascript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in Server Components (read-only)
          }
        },
      },
    }
  )
}
```

---

### Paso 4: Crear middleware de auth

Crear archivo:  
📄 `src/middleware.js`

```javascript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no está logueado y no está en /login, redirigir a /login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si está logueado y está en /login, redirigir a /
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

### Paso 5: Crear constantes del sistema

Crear archivo:  
📄 `src/lib/constants.js`

```javascript
export const CONTAINER_STATES = {
  deposito: { label: 'En Depósito', color: 'bg-yellow-100 text-yellow-800' },
  transito: { label: 'En Tránsito', color: 'bg-blue-100 text-blue-800' },
  aduana: { label: 'En Aduana', color: 'bg-orange-100 text-orange-800' },
  finalizado: { label: 'Finalizado', color: 'bg-green-100 text-green-800' },
}

export const WAREHOUSES = {
  HK: { label: 'Hong Kong', flag: '🇭🇰' },
  CH: { label: 'China', flag: '🇨🇳' },
  USA: { label: 'Estados Unidos', flag: '🇺🇸' },
}

export const CONTAINER_TYPES = {
  '20': { label: "20'", lengthCm: 589, widthCm: 235, heightCm: 239, maxWeightKg: 28200 },
  '40': { label: "40'", lengthCm: 1203, widthCm: 235, heightCm: 239, maxWeightKg: 28600 },
  '40HC': { label: "40' HC", lengthCm: 1203, widthCm: 235, heightCm: 269, maxWeightKg: 28400 },
}

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/contenedores', label: 'Contenedores', icon: 'Container' },
  { href: '/clientes', label: 'Clientes', icon: 'Users' },
  { href: '/etiquetas', label: 'Etiquetas', icon: 'Tags' },
  { href: '/calculadora-volumetrica', label: 'Volumétrica', icon: 'Box' },
  { href: '/historico', label: 'Histórico', icon: 'Archive' },
]
```

---

### Paso 6: Crear componentes de layout

Crear archivo:  
📄 `src/components/layout/Sidebar.js`

```javascript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Container, Users, Tags, Box, Archive,
  LogOut, Ship
} from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const iconMap = {
  LayoutDashboard, Container, Users, Tags, Box, Archive,
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Ship className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold">Logística</h1>
            <p className="text-xs text-gray-400">Internacional</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {item.label}
            </Link>
          )
        })}
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
    </aside>
  )
}
```

Crear archivo:  
📄 `src/components/layout/Header.js`

```javascript
import { createClient } from '@/lib/supabase/server'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        {/* Breadcrumbs se agregarán después */}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
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

---

### Paso 7: Crear página de login

Crear archivo:  
📄 `src/app/login/page.js`

```javascript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Ship } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Ship className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Logística Internacional</h1>
          <p className="text-gray-400 mt-2">Iniciar sesión</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

### Paso 8: Actualizar layout raíz

Reemplazar **completamente** el contenido de:  
📄 `src/app/layout.js`

```javascript
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Logística Internacional',
  description: 'Sistema de gestión de logística internacional',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario, no mostrar layout completo (login tiene su propio layout)
  const isAuthenticated = !!user

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {isAuthenticated ? (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Header />
              <main className="p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
                {children}
              </main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
```

---

### Paso 9: Reemplazar página principal

Reemplazar **completamente** el contenido de:  
📄 `src/app/page.js`

```javascript
import { Container, Users, Ship } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Contenedores */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Container className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Contenedores Activos</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
          </div>
        </div>

        {/* Card: Clientes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
          </div>
        </div>

        {/* Card: En Tránsito */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Tránsito</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder: próximos ETAs */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Próximos Arribos</h2>
        <p className="text-gray-400 text-sm">No hay contenedores en tránsito</p>
      </div>
    </div>
  )
}
```

---

### Paso 10: Crear páginas placeholder

Crear las siguientes páginas vacías. Cada una tiene el MISMO patrón:

📄 `src/app/contenedores/page.js`
```javascript
export default function ContenedoresPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contenedores</h1>
      <p className="text-gray-400">Módulo en construcción</p>
    </div>
  )
}
```

📄 `src/app/clientes/page.js`
```javascript
export default function ClientesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h1>
      <p className="text-gray-400">Módulo en construcción</p>
    </div>
  )
}
```

📄 `src/app/etiquetas/page.js`
```javascript
export default function EtiquetasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Etiquetas</h1>
      <p className="text-gray-400">Módulo en construcción</p>
    </div>
  )
}
```

📄 `src/app/calculadora-volumetrica/page.js`
```javascript
export default function VolumetricaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Calculadora Volumétrica</h1>
      <p className="text-gray-400">Módulo en construcción</p>
    </div>
  )
}
```

📄 `src/app/historico/page.js`
```javascript
export default function HistoricoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Histórico</h1>
      <p className="text-gray-400">Módulo en construcción</p>
    </div>
  )
}
```

---

### Paso 11: Actualizar globals.css

Reemplazar **completamente** el contenido de:  
📄 `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #f9fafb;
  --foreground: #111827;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

---

### Paso 12: Verificar F1.1

```bash
npm run build
```

**Debe compilar sin errores.** Si hay errores, revisar que todos los archivos se crearon en las rutas correctas.

```bash
git add -A
git commit -m "feat(F1.1): auth + layout base with Supabase" --no-verify
git push origin master
```

**Verificar visualmente**: Correr `npm run dev`, abrir `http://localhost:3000`. Debe redirigir a `/login`. Crear un usuario en Supabase dashboard (Authentication → Users → Add User) y probar login.

---

## F2.1 — Gestión de Contenedores

**Skills a leer antes**: `.agents/skills/supabase-patterns/SKILL.md`  
**Prerequisito**: F1.1 completado

> [!IMPORTANT]
> Plan detallado para este feature a escribir cuando F1.1 esté implementado y verificado. El patrón es el mismo: migración SQL → server actions → componentes → página → verificar → commit.

### Resumen de archivos a crear:

| Archivo | Tipo |
|---|---|
| `supabase/migrations/002_containers.sql` | Migración: tablas `containers`, `container_dimensions` + seed |
| `src/app/contenedores/page.js` | REEMPLAZAR placeholder con lista real |
| `src/app/contenedores/nuevo/page.js` | Formulario de creación |
| `src/app/contenedores/[id]/page.js` | Detalle con tabs |
| `src/app/contenedores/actions.js` | Server Actions (CRUD + cambio estado) |
| `src/components/contenedores/ContainerForm.js` | Formulario reutilizable |
| `src/components/contenedores/ContainerCard.js` | Card para la lista |
| `src/components/contenedores/ContainerFilters.js` | Filtros (estado, origen) |
| `src/components/ui/StatusBadge.js` | Badge de estado reutilizable |

### Lógica de código auto-generado:
```
Formato: {ORIGEN}-{AÑO}-{SEQ}
Ejemplo: HK-2026-001

Implementar en el Server Action de creación:
1. Obtener el último código del mismo origen y año
2. Incrementar secuencia
3. Formatear con padStart(3, '0')
```

---

## F2.2 — Importación de Packing Lists

**Skills a leer antes**: `.agents/skills/excel-handling/SKILL.md`  
**Instalar al comenzar**: `npm install xlsx @tanstack/react-table`  
**Prerequisito**: F2.1 completado

### Resumen de archivos a crear:

| Archivo | Tipo |
|---|---|
| `supabase/migrations/003_packing_lists.sql` | Migración: tablas `packing_lists`, `packing_list_items` |
| `src/app/contenedores/[id]/packing-list/page.js` | Página de packing list |
| `src/app/contenedores/[id]/packing-list/actions.js` | Server Actions |
| `src/components/packing-list/PackingListImporter.js` | Drag & drop + preview |
| `src/components/packing-list/ColumnMapper.js` | Mapeo de columnas |
| `src/components/packing-list/PackingListTable.js` | Tabla con datos importados |
| `src/components/ui/FileUpload.js` | Componente drag & drop reutilizable |

### Flujo de importación:
```
1. Usuario arrastra Excel al FileUpload
2. SheetJS parsea client-side
3. Se muestra preview (primeras 5 filas)
4. Se muestra ColumnMapper (auto-detect + manual)
5. Usuario confirma mapeo
6. Server Action guarda items en DB
7. Se muestra PackingListTable con datos importados
```

---

## F2.3 — Clientes + Etiquetas + Clasificación

**Skills a leer antes**: `.agents/skills/supabase-patterns/SKILL.md`  
**Prerequisito**: F2.2 completado

### Resumen de archivos a crear:

| Archivo | Tipo |
|---|---|
| `supabase/migrations/004_clients_tags.sql` | Migración: `clients`, `client_rate_history`, `tags`, `item_tags` |
| `src/app/clientes/page.js` | REEMPLAZAR placeholder |
| `src/app/clientes/[id]/page.js` | Ficha de cliente |
| `src/app/clientes/actions.js` | Server Actions |
| `src/app/etiquetas/page.js` | REEMPLAZAR placeholder |
| `src/app/etiquetas/actions.js` | Server Actions |
| `src/components/clientes/ClientForm.js` | Formulario |
| `src/components/clientes/ClientSummary.js` | Resumen con contenedores |
| `src/components/packing-list/ItemClassifier.js` | Asignar cliente + etiquetas a items |
| `src/components/ui/TagInput.js` | Input de etiquetas con sugerencias |

### Lógica de normalización de etiquetas:
```
1. Al crear etiqueta, normalizar: lowercase, trim, quitar acentos
2. Guardar `name` (original) y `normalized_name` (normalizado)
3. Al escribir en TagInput, buscar por normalized_name con ILIKE
4. Si existe similar, sugerir. Si no, permitir crear nueva.
```

---

## F3.1 — Calculadora de Costos ✅ COMPLETADO

> Implementado según `docs/f3_plan.md` (F3.2 en ese plan).
> Migración aplicada como `004_cost_calculations.sql` (no 005 como en el plan original).

### Archivos creados:

| Archivo | Tipo |
|---|---|
| `supabase/migrations/004_cost_calculations.sql` | Migración: `cost_calculations`, `cost_items` |
| `src/lib/calculadora/engine.js` | Lógica pura de cálculo |
| `src/lib/calculadora/defaults.js` | Matriz default |
| `src/app/contenedores/[id]/costos/page.js` | Página de costos |
| `src/app/contenedores/[id]/costos/actions.js` | Server Actions |
| `src/components/calculadora/CostMatrix.js` | Matriz dinámica con toggle y resumen integrado |

### Reglas del engine:
```
- Función pura: recibe inputs + matrix, devuelve resultados
- NO redondear valores intermedios
- Respetar la cadena de bases: FOB → CIF → Base Imponible → Total
- La salida cliente es una COPIA con overrides (client_value, client_active, client_label)
- Distribución por cliente: proporcional al volumen
```

---

## F3.2 — Volumétrica + Tipo de Cambio ✅ COMPLETADO

> Implementado según `docs/f3_plan.md` (F3.1 en ese plan).
> Migración aplicada como `003_exchange_rates.sql` (no 006 como en el plan original).

### Archivos creados:

| Archivo | Tipo |
|---|---|
| `supabase/migrations/003_exchange_rates.sql` | Migración: `exchange_rates` |
| `src/lib/calculadora/volumetric.js` | Lógica de cálculo |
| `src/hooks/useExchangeRate.js` | Hook para rates |
| `src/app/calculadora-volumetrica/page.js` | Página reemplazada con calculadora funcional |
| `src/app/api/exchange-rate/route.js` | API proxy para DolarAPI.com |
| `src/components/calculadora/VolumetricCalc.js` | Componente UI completo |
| `src/components/calculadora/ExchangeRateSelector.js` | Selector de tipo de dólar |

### Fórmula volumétrica:
```
cajasLargo = Math.floor(containerLength / boxLength)
cajasAncho = Math.floor(containerWidth / boxWidth)
cajasAlto  = Math.floor(containerHeight / boxHeight)
totalCajas = cajasLargo × cajasAncho × cajasAlto
pesoTotal  = totalCajas × pesoUnitario
valid       = pesoTotal <= maxWeight
```

---

## F4.1 — Dashboards + Consultas + Export + Histórico

**Skills a leer antes**: `.agents/skills/excel-handling/SKILL.md` (sección ExcelJS)  
**Instalar al comenzar**: `npm install exceljs`  
**Prerequisito**: Todos los features anteriores

### Resumen de archivos a crear:

| Archivo | Tipo |
|---|---|
| `src/app/page.js` | REEMPLAZAR con dashboard real (queries a DB) |
| `src/app/historico/page.js` | REEMPLAZAR con contenedores finalizados |
| `src/app/api/export/route.js` | API de exportación |
| `src/lib/excel/exporter.js` | Generar .xlsx (por contenedor y por cliente) |
| `src/components/dashboard/StatusOverview.js` | Gráfico/cards de estado |
| `src/components/dashboard/UpcomingETAs.js` | Tabla de próximos ETAs |
| `src/components/dashboard/ClientSummaryCards.js` | Resumen por cliente |
| `src/components/ui/ExportButton.js` | Botón de exportación reutilizable |

---

## Checklist Final

Después de completar TODOS los features:

- [ ] `npm run build` pasa sin errores
- [ ] `npm run map:full` regenera contexto
- [ ] Login funciona
- [ ] CRUD de contenedores funciona
- [ ] Import de Excel funciona
- [ ] Asignación de clientes/etiquetas funciona
- [ ] Calculadora de costos calcula correctamente
- [ ] Doble salida (real vs cliente) funciona
- [ ] Volumétrica calcula cajas correctamente
- [ ] Tipo de cambio se obtiene de API
- [ ] Dashboards muestran datos reales
- [ ] Export genera .xlsx válido
- [ ] Histórico muestra contenedores finalizados
- [ ] `git push origin master` — todo en GitHub
