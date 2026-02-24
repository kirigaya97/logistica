---
name: supabase-patterns
description: Patterns for Supabase operations - client creation, server actions, migrations, RLS
---

# Supabase Patterns

## Client Creation

### Browser Client (`src/lib/supabase/client.js`)
```javascript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

### Server Client (`src/lib/supabase/server.js`)
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
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Middleware (`src/middleware.js`)
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
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

## Server Actions Pattern
```javascript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const containerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  origin_warehouse: z.enum(['HK', 'CH', 'USA']),
  container_type: z.enum(['20', '40', '40HC']),
})

export async function createContainer(formData) {
  const supabase = await createClient()
  const parsed = containerSchema.parse(Object.fromEntries(formData))
  
  const { data, error } = await supabase
    .from('containers')
    .insert(parsed)
    .select()
    .single()
  
  if (error) throw new Error(`Error al crear contenedor: ${error.message}`)
  revalidatePath('/contenedores')
  return data
}
```

## Migration Conventions
- File naming: `NNN_description.sql` (e.g., `001_initial_schema.sql`)
- Location: `supabase/migrations/`
- Always include `IF NOT EXISTS` for safety
- Always include RLS policies
- Standard RLS for authenticated users:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON table_name
  FOR ALL USING (auth.role() = 'authenticated');
```

## Error Handling
```javascript
const { data, error } = await supabase.from('table').select()
if (error) {
  console.error('Supabase error:', error)
  throw new Error('Error al obtener datos')  // Spanish for user
}
```

## DO NOT
- Do NOT use `@supabase/auth-helpers` (deprecated)
- Do NOT make Supabase calls in `useEffect` — use Server Components
- Do NOT expose `service_role` key in client code
- Do NOT skip RLS policies
