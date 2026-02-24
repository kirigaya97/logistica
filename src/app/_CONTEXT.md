# 📁 src/app

## Propósito
Directorio raíz de la aplicación (Next.js App Router). Actúa como el punto de entrada principal para la interfaz de usuario, definiendo la estructura visual base, los estilos globales y el tablero de control (dashboard) inicial del sistema de gestión logística.

## Archivos
| Archivo | Descripción |
|---|---|
| `globals.css` | Define los estilos globales de la aplicación, la configuración de Tailwind CSS y las variables base de colores. |
| `layout.js` | Layout raíz que maneja la estructura general de la página. Incluye lógica de renderizado condicional basada en la autenticación del usuario para mostrar o no la navegación principal (Sidebar y Header). |
| `page.js` | Página de inicio (Dashboard) que muestra un resumen de la operativa logística con tarjetas de métricas para contenedores activos, clientes, envíos en tránsito y próximos arribos. |

## Relaciones
- **Usa**: Componentes de diseño (`@/components/layout/Sidebar`, `@/components/layout/Header`), utilidades de base de datos (`@/lib/supabase/server`), iconos vectoriales (`lucide-react`) y tipografía (`next/font/google`).
- **Usado por**: Framework Next.js (Punto de entrada automático para el manejo de rutas de la aplicación).

## Detalles clave
- **Layout Condicional por Autenticación**: El `RootLayout` verifica el estado de la sesión de manera asíncrona mediante Supabase. Si hay un usuario autenticado, renderiza la estructura completa (con barra lateral y cabecera); si no, renderiza solo los componentes hijos (permitiendo layouts limpios para páginas como el login).
- **Indicadores Clave de Rendimiento (KPIs)**: El dashboard está estructurado para mostrar información crítica de negocio (contenedores, clientes, estado de tránsito) de forma rápida y accesible.
- **Estructura de Enrutamiento**: Los subdirectorios existentes (`calculadora-volumetrica`, `clientes`, `contenedores`, `etiquetas`, `historico`, `login`) definen las rutas principales y la arquitectura de navegación de la plataforma.