# 📁 src/app

## Propósito
Punto de entrada principal y sistema de enrutamiento de la aplicación Next.js. Gestiona el layout global, la autenticación de nivel raíz y el panel de control (Dashboard) que centraliza las métricas clave de la operación logística.

## Archivos
| Archivo | Descripción |
|---|---|
| globals.css | Estilos globales del sistema, definición de variables de tema y configuración base de Tailwind CSS. |
| layout.js | Layout raíz que implementa la verificación de sesión, estructura de navegación (Sidebar/Header) y el buscador global (Command Palette). |
| page.js | Página principal (Dashboard) que muestra estadísticas de contenedores, clientes activos, volumen en tránsito y próximos arribos. |

## Relaciones
- **Usa**: `@/lib/supabase/server` para gestión de datos y auth, `@/components/layout` para la estructura UI, y `@/lib/constants` para estados y almacenes.
- **Usado por**: Next.js App Router como base del árbol de renderizado.

## Detalles clave
- **Autenticación en Raíz**: El `RootLayout` es un componente de servidor que protege la interfaz; si no hay usuario, renderiza el contenido (usualmente el login) sin el marco de navegación.
- **Métricas del Dashboard**: Realiza consultas directas a Supabase para contar registros y sumar el volumen (`volume_m3`) de los ítems en tránsito vinculando las tablas de contenedores y packing lists.
- **Estructura Responsiva**: Implementa un `MobileMenuProvider` (Context API) para coordinar la apertura y cierre del menú lateral entre el `Header` y la `Sidebar` en dispositivos móviles.
- **UX**: Integra el `CommandPalette` a nivel global, permitiendo acceso rápido mediante teclado a contenedores, clientes y herramientas.