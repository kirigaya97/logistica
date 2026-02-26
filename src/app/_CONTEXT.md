# 📂 src/app

## Propósito
Este directorio constituye el núcleo de la aplicación mediante el App Router de Next.js. Gestiona la estructura visual global, la validación de la sesión de usuario y el panel de control (Dashboard) con las métricas operativas del sistema.

## Archivos
| Archivo | Descripción |
|---|---|
| `globals.css` | Configuración de estilos globales, variables de CSS para el tema (colores de fondo/texto) y directivas de Tailwind CSS. |
| `layout.js` | Layout raíz de la aplicación; implementa la fuente Inter, gestiona la autenticación y organiza la estructura de Sidebar, Header y buscador global. |
| `page.js` | Página principal (Dashboard) que muestra contadores de contenedores y clientes, volúmenes en tránsito y el listado de próximos arribos. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (autenticación y consultas), `@/lib/constants` (maestros de almacenes y navegación), `@/components/layout` (Sidebar, Header, CommandPalette) y `@/components/ui/StatusBadge`.
- **Usado por**: Es el punto de entrada jerárquico; todos los subdirectorios (como `contenedores/` o `clientes/`) se renderizan dentro de su estructura de `RootLayout`.

## Detalles clave
- **Gestión de Autenticación**: El `RootLayout` verifica la sesión del lado del servidor. Si el usuario está autenticado, envuelve la aplicación en un `MobileMenuProvider` y muestra los componentes de navegación; de lo contrario, solo renderiza el contenido (permitiendo el acceso al login).
- **Métricas Agregadas**: El Dashboard realiza cálculos dinámicos, como la sumatoria del volumen en metros cúbicos (`volume_m3`) de todos los items en tránsito, uniendo tablas de contenedores y packing lists.
- **Estructura Responsiva**: El diseño utiliza una barra lateral fija en pantallas grandes (`lg:ml-64`) y un menú desplegable gestionado por contexto para dispositivos móviles.
- **Acceso Rápido**: Integra un `CommandPalette` que permite la navegación rápida y búsqueda de registros mediante el atajo de teclado Ctrl+K.