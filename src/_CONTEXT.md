# 📂 src

## Propósito
Directorio raíz del código fuente de la aplicación. Centraliza la lógica de negocio, la estructura de navegación, los componentes de la interfaz de usuario y las integraciones con servicios externos.

## Archivos
| Archivo | Descripción |
|---|---|
| middleware.js | Gestiona la seguridad de las rutas y la persistencia de la sesión de usuario mediante Supabase SSR. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/server`.
- **Usado por**: El framework Next.js para interceptar peticiones y validar el estado de autenticación antes de renderizar páginas.

## Detalles clave
- **Autenticación Obligatoria**: Implementa una política de "privado por defecto", redirigiendo a `/login` cualquier intento de acceso no autenticado a rutas del sistema.
- **Gestión de Sesión**: Utiliza `createServerClient` para el manejo dinámico de cookies, permitiendo que la sesión se mantenga actualizada tanto en el cliente como en el servidor.
- **Exclusiones del Middleware**: El matcher está configurado para ignorar archivos estáticos (imágenes, favicons) y rutas de API, optimizando el rendimiento.