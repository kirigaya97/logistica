# 📁 src/lib/supabase

## Propósito
Provee los clientes de conexión a la base de datos Supabase, tanto para el entorno del navegador (cliente) como para el entorno del servidor (Next.js).

## Archivos
| Archivo | Descripción |
|---|---|
| client.js | Instancia y configura el cliente de Supabase para su uso en componentes del lado del cliente. |
| server.js | Instancia y configura el cliente de Supabase para el servidor, integrando el manejo asíncrono de cookies de Next.js. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/headers`
- **Usado por**: Por determinar (típicamente usado en componentes de Next.js, Server Actions, Route Handlers y Middleware).

## Detalles clave
- Utiliza la librería `@supabase/ssr` para la integración moderna con el App Router de Next.js.
- Depende de las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- El cliente de servidor (`server.js`) ignora silenciosamente los errores al intentar establecer cookies dentro de Server Components (ya que son de solo lectura), aplicando el patrón estándar recomendado por Supabase.