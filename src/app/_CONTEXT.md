# 📂 src/app

## Propósito
Punto de entrada principal de la aplicación utilizando Next.js App Router. Gestiona el armazón (shell) global del sistema, la verificación de autenticación raíz y la visualización del panel de control central.

## Archivos
| Archivo | Descripción |
|---|---|
| globals.css | Definiciones de estilos globales, variables de CSS para el tema y configuración base de Tailwind. |
| layout.js | Componente raíz que envuelve la aplicación; gestiona la sesión de usuario, el proveedor de menú móvil y la estructura de navegación persistente. |
| page.js | Vista del Dashboard principal que consolida métricas de contenedores, volumen en tránsito, clientes activos y próximos arribos. |

## Relaciones
- **Usa**: `@/lib/supabase/server` para gestión de sesión y datos, `@/components/layout` para la interfaz base, `@/lib/constants` para diccionarios de estados y almacenes, y `lucide-react` para iconografía.
- **Usado por**: Framework Next.js como punto de montaje de la aplicación.

## Detalles clave
- **Control de Acceso**: El `layout.js` actúa como guardián; si no hay un usuario autenticado, no renderiza los componentes de navegación (Sidebar/Header), permitiendo que las páginas de login operen fuera del shell principal.
- **Métricas en Tiempo Real**: El dashboard (`page.js`) realiza consultas agregadas directamente a Supabase para calcular el volumen total (m³) basado en los ítems de los packing lists en tránsito.
- **Navegación Global**: Integra un `CommandPalette` accesible mediante atajos de teclado (Ctrl+K) para búsqueda rápida de entidades en todo el sistema.
- **Diseño Adaptable**: Utiliza un `MobileMenuProvider` para coordinar la apertura y cierre del menú lateral en dispositivos móviles desde distintos componentes del header.