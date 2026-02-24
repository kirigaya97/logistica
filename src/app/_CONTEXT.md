# 📂 src/app

## Propósito
Punto de entrada principal de la aplicación que define la estructura global del sitio, los estilos base y el panel de control (dashboard) con métricas operativas clave.

## Archivos
| Archivo | Descripción |
|---|---|
| globals.css | Definiciones de estilos globales, variables de tema (colores) y configuración base de Tailwind CSS. |
| layout.js | Componente raíz que gestiona la persistencia del estado de autenticación y la disposición de elementos globales (Sidebar, Header, CommandPalette). |
| page.js | Página principal del Dashboard que visualiza indicadores de gestión, próximos arribos y volumen de carga en tránsito. |

## Relaciones
- **Usa**: `@/components/layout/`, `@/components/ui/StatusBadge`, `@/lib/supabase/server`, `@/lib/constants`, `lucide-react`.
- **Usado por**: Next.js App Router (Raíz del proyecto).

## Detalles clave
- **Control de Acceso**: El `layout.js` verifica la sesión mediante Supabase; si el usuario no está autenticado, renderiza el contenido sin la estructura de navegación lateral ni cabecera (permitiendo la visualización del login).
- **Métricas en Tiempo Real**: El Dashboard realiza consultas directas a Supabase para obtener conteos exactos de contenedores, clientes activos y cálculos de volumen (m³) acumulado.
- **Visualización de Estado**: Utiliza `CONTAINER_STATES` y `WAREHOUSES` definidos en las constantes del sistema para estandarizar etiquetas, colores y banderas.
- **Navegación Global**: Integra un `CommandPalette` accesible vía teclado (Ctrl+K) para búsqueda rápida de recursos en todo el sistema.
- **Diseño Responsivo**: La estructura principal utiliza un layout de flexbox con un margen lateral compensado para el Sidebar fijo.