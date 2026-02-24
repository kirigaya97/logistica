# 📁 src/components/layout

## Propósito
Este directorio contiene los componentes estructurales globales de la interfaz de usuario que forman el esqueleto de la aplicación. Proveen la navegación principal, el encabezado y las opciones de gestión de sesión que se mantienen constantes en las distintas vistas del sistema de logística.

## Archivos
| Archivo | Descripción |
|---|---|
| Header.js | Componente de servidor que muestra la información del usuario autenticado (email y avatar inicial) e incluye un espacio reservado para futuras migas de pan (breadcrumbs). |
| Sidebar.js | Componente de cliente que renderiza la barra de navegación lateral dinámica y maneja la lógica de cierre de sesión del usuario. |

## Relaciones
- **Usa**: `@/lib/supabase/server` y `@/lib/supabase/client` para la gestión de autenticación y sesión; `@/lib/constants` para obtener los ítems del menú (`NAV_ITEMS`); `next/navigation` y `next/link` para el enrutamiento; y `lucide-react` para la iconografía visual.
- **Usado por**: `src/app/layout.js` (Estructuralmente inferido, al ser el layout principal de la aplicación).

## Detalles clave
- **Patrón de Renderizado**: Utiliza una combinación eficiente de Server Components (`Header.js` para consultar la sesión directamente de forma segura) y Client Components (`Sidebar.js` para manejar interactividad como el ruteo activo y el botón de logout).
- **Navegación Dinámica**: La lista de enlaces en la barra lateral se construye iterando sobre la configuración `NAV_ITEMS` centralizada en las constantes del proyecto, facilitando su escalabilidad.
- **Gestión de Sesión**: `Header.js` valida y muestra el estado actual del usuario al cargar la página, mientras que `Sidebar.js` provee el mecanismo activo para cerrar la sesión actual y redirigir al `/login`.
- **Diseño Responsivo y Estilos**: Se apoya fuertemente en clases de Tailwind CSS para layouts fijos (fixed sidebar, flexbox header), garantizando una estructura de panel de control (dashboard) estándar.