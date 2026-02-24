# 🏗️ src/components/layout

## Propósito
Este directorio contiene los componentes estructurales que definen la interfaz base de la aplicación, gestionando la navegación principal, el encabezado y utilidades globales de acceso rápido.

## Archivos
| Archivo | Descripción |
|---|---|
| CommandPalette.js | Interfaz de búsqueda global (Ctrl+K) que permite localizar contenedores, clientes y etiquetas mediante consultas asíncronas a Supabase. |
| Header.js | Barra superior de la aplicación que muestra el perfil del usuario autenticado y el disparador del menú móvil. |
| MobileMenuButton.js | Botón interactivo que controla la apertura del menú lateral en resoluciones móviles mediante el contexto global del menú. |
| MobileMenuContext.js | Proveedor de estado de React que gestiona la visibilidad del menú lateral de forma compartida entre el Header y el Sidebar. |
| Sidebar.js | Navegación lateral principal que organiza los accesos por grupos y muestra indicadores dinámicos sobre la cantidad de contenedores activos. |

## Relaciones
- **Usa**: `lucide-react` para iconografía, `next/navigation` para gestión de rutas, `@/lib/supabase` para datos de sesión y búsquedas, y `@/lib/constants` para la estructura de navegación.
- **Usado por**: Típicamente invocado en el layout raíz de la aplicación (`src/app/layout.js`) para envolver el contenido de todas las páginas.

## Detalles clave
- **Navegación Basada en Configuración**: El `Sidebar` renderiza sus elementos basándose en el objeto `NAV_GROUPS` definido en las constantes del proyecto, facilitando el mantenimiento de las secciones.
- **Búsqueda Multi-Entidad**: El `CommandPalette` realiza búsquedas paralelas en las tablas de contenedores, clientes y etiquetas, proporcionando navegación directa a los resultados seleccionados.
- **Badge Dinámico**: El menú lateral incluye una consulta en tiempo real para mostrar el conteo de contenedores que no están en estado "finalizado", sirviendo como indicador de carga de trabajo activa.
- **Adaptabilidad (Responsive)**: Implementa un patrón de menú lateral dual: una versión fija para pantallas grandes y un *overlay* animado para dispositivos móviles controlado por el `MobileMenuContext`.