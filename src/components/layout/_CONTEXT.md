# 📂 src/components/layout

## Propósito
Este directorio contiene los componentes estructurales de interfaz de usuario que se comparten a través de las diferentes páginas de la aplicación. Proporciona la plantilla visual base, incluyendo la navegación y la barra superior, manteniendo una experiencia de usuario consistente.

## Archivos
| Archivo | Descripción |
|---|---|
| `Header.js` | Componente de servidor que renderiza la barra superior y muestra la información del usuario autenticado (email e inicial). |
| `Sidebar.js` | Componente de cliente que provee la barra de navegación lateral principal, iterando sobre las rutas del sistema y manejando la acción de cierre de sesión. |

## Relaciones
- **Usa**: 
  - `@/lib/supabase/server` y `@/lib/supabase/client` (para autenticación y gestión de sesión).
  - `@/lib/constants` (para definir los elementos del menú `NAV_ITEMS`).
  - `next/link`, `next/navigation` (para el enrutamiento y detección de ruta activa).
  - `lucide-react` (para la iconografía de la interfaz).
- **Usado por**: Típicamente consumido por los archivos de layout de Next.js (como `src/app/layout.js`).

## Detalles clave
- **Arquitectura de componentes**: `Header.js` es un Server Component que aprovecha la obtención directa de datos de sesión desde el servidor, mientras que `Sidebar.js` es un Client Component (`'use client'`) debido a su interactividad y uso de hooks (`usePathname`, `useRouter`).
- **Navegación dinámica**: El menú lateral se renderiza de forma dinámica consumiendo la constante `NAV_ITEMS`, facilitando la adición de nuevas secciones en el futuro sin modificar el componente.
- **Gestión de sesión**: El `Sidebar` incluye directamente la lógica de cierre de sesión (`signOut`), redirigiendo al usuario a la vista de `/login` tras ejecutar la acción.