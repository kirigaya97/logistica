# 📂 src/components/layout

## Propósito
Este directorio contiene los componentes estructurales base de la interfaz de usuario de la aplicación, incluyendo la navegación principal, el encabezado y las herramientas de acceso rápido global.

## Archivos
| Archivo | Descripción |
|---|---|
| `CommandPalette.js` | Componente cliente que implementa una paleta de búsqueda y acciones rápidas accesible vía atajo de teclado (Cmd/Ctrl + K), consultando múltiples entidades de la base de datos. |
| `Header.js` | Componente de servidor que renderiza la barra superior de la aplicación, encargado de mostrar el estado y la información del usuario autenticado. |
| `Sidebar.js` | Componente cliente que maneja el menú de navegación lateral, mostrando enlaces estructurados, indicadores de estado (como contenedores activos) y la funcionalidad de cierre de sesión. |

## Relaciones
- **Usa**: `@/lib/supabase/client`, `@/lib/supabase/server`, `@/lib/constants`, `next/navigation`, `lucide-react`.
- **Usado por**: `src/app/layout.js` (Inferido como parte del layout principal de la aplicación).

## Detalles clave
- La **Paleta de Comandos** (`CommandPalette.js`) optimiza la carga consultando de forma asíncrona y simultánea (con un debounce de 300ms) a las tablas `containers`, `clients` y `tags` en Supabase.
- El **Sidebar** (`Sidebar.js`) mantiene un contador dinámico que consulta la base de datos para mostrar la cantidad de contenedores que no están en estado "finalizado".
- Se utiliza un enfoque mixto de renderizado: `Header.js` es un componente de servidor para acceder a la sesión de forma segura, mientras que `Sidebar.js` y `CommandPalette.js` son componentes de cliente para manejar la interactividad y los atajos de teclado.