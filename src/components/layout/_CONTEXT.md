# 🏗️ src/components/layout

## Propósito
Este directorio contiene los componentes estructurales que definen el marco visual y la navegación persistente de la plataforma, asegurando una experiencia de usuario coherente en toda la aplicación.

## Archivos
| Archivo | Descripción |
|---|---|
| Header.js | Componente de servidor que muestra la identidad del usuario autenticado y actúa como contenedor para la navegación secundaria (breadcrumbs). |
| Sidebar.js | Barra de navegación lateral que gestiona el acceso a los módulos principales, el estado activo de las rutas y la funcionalidad de cierre de sesión. |

## Relaciones
- **Usa**: `@/lib/supabase/server`, `@/lib/supabase/client`, `@/lib/constants` (NAV_ITEMS), `lucide-react`, `next/link`, `next/navigation`.
- **Usado por**: `src/app/layout.js` (Estructura base de la aplicación).

## Detalles clave
- **Estrategia de Componentes**: Combina Server Components (Header) para la obtención eficiente de datos de sesión y Client Components (Sidebar) para la interactividad de la interfaz.
- **Navegación Dinámica**: El Sidebar se construye a partir de la constante `NAV_ITEMS`, utilizando un mapeo de iconos (`iconMap`) para renderizar componentes de Lucide dinámicamente.
- **Gestión de Sesión**: Integración directa con Supabase Auth para mostrar el perfil del usuario en el encabezado y ejecutar el proceso de `signOut` en el menú lateral.
- **Layout Fijo**: El Sidebar utiliza posicionamiento fijo (`fixed`) para mantener la navegación siempre accesible mientras el contenido principal se desplaza.