# 📁 src/app

## Propósito
Directorio raíz de la aplicación Next.js (App Router). Contiene el layout global, la configuración de estilos base y el panel de control principal (Dashboard) del sistema de gestión de logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| `globals.css` | Define las variables CSS globales y la integración base con Tailwind CSS para el tema claro/oscuro. |
| `layout.js` | Layout principal de la aplicación. Maneja la estructura de la página, carga de fuentes (Inter) y renderizado condicional del Sidebar y Header basado en la autenticación del usuario vía Supabase. |
| `page.js` | Vista del Dashboard principal que muestra tarjetas de resumen (Contenedores Activos, Clientes, En Tránsito) y próximos arribos. |

## Relaciones
- **Usa**: `@/components/layout/Sidebar`, `@/components/layout/Header`, `@/lib/supabase/server`, `next/font/google`, `lucide-react`, `tailwindcss`.
- **Usado por**: Next.js App Router (Punto de entrada de la UI).

## Detalles clave
- **Autenticación en Layout**: `layout.js` verifica el estado de la sesión usando Supabase Server Client. Si el usuario no está autenticado, renderiza solo el contenido (útil para la página de login); si lo está, envuelve el contenido con la navegación principal (`Sidebar` y `Header`).
- **Dashboard Estático**: Actualmente `page.js` presenta una estructura de panel de control con valores en cero (placeholders) que requerirán integración con datos reales de la base de datos.
- **Enrutamiento basado en carpetas**: Contiene subdirectorios que definen las distintas rutas de la aplicación como contenedores, clientes, histórico, login y utilidades como la calculadora volumétrica.