# 📂 src/app

## Propósito
Directorio raíz de la aplicación Next.js (App Router) que contiene el layout global, la hoja de estilos principal y el panel de control (Dashboard) de inicio. Gestiona la estructura visual base según el estado de autenticación del usuario y centraliza las métricas de alto nivel del sistema logístico.

## Archivos
| Archivo | Descripción |
|---|---|
| globals.css | Define los estilos globales, la integración principal con Tailwind CSS y las variables de color fundamentales para el tema. |
| layout.js | Componente de diseño raíz. Verifica la sesión del usuario para decidir si muestra la estructura de navegación completa (Sidebar, Header, CommandPalette) o simplemente renderiza los componentes hijos (útil para la pantalla de login). |
| page.js | Vista principal (Dashboard) renderizada del lado del servidor. Consulta métricas en tiempo real sobre clientes, contenedores en tránsito, volumen estimado y distribución por almacén de origen. |

## Relaciones
- **Usa**: Componentes de layout (Sidebar, Header, CommandPalette), componentes UI (StatusBadge), utilidades de Supabase para servidor, constantes de negocio (WAREHOUSES, CONTAINER_STATES) y librerías externas como lucide-react y utilidades de Next.js.
- **Usado por**: El framework Next.js como punto de entrada para la estructura de la interfaz y la ruta principal (/).

## Detalles clave
- **Layout condicional**: El archivo layout.js actúa como un guardián visual básico, evitando cargar la barra lateral y la cabecera si la consulta a Supabase indica que no hay una sesión activa.
- **Cálculo de volumen en tránsito**: El dashboard realiza cruces de datos (joins) a nivel de base de datos para sumar el volumen (m3) de los items empaquetados específicamente en aquellos contenedores cuyo estado es "tránsito".
- **Estructura modular**: Aloja en sus subdirectorios las rutas para todas las entidades y herramientas principales del sistema logístico, separando claramente las calculadoras, la gestión de clientes y el seguimiento de contenedores.