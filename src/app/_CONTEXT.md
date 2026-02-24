# 📁 src/app

## Propósito
Este directorio es el núcleo del enrutamiento de la aplicación (App Router de Next.js), conteniendo la página de inicio (dashboard), el layout principal envolvente para toda la plataforma y las configuraciones de estilos globales.

## Archivos
| Archivo | Descripción |
|---|---|
| `globals.css` | Define los estilos globales, importaciones de Tailwind CSS y las variables de diseño de colores principales (background, foreground). |
| `layout.js` | Define el esqueleto visual (HTML/Body) y el diseño estructural de la app. Implementa verificación de sesión del lado del servidor para conditionally renderizar componentes de navegación (Sidebar y Header). |
| `page.js` | Renderiza el Dashboard principal de la aplicación. Muestra tarjetas con métricas operativas (contenedores activos, clientes, en tránsito) y un panel para próximos arribos. |

## Relaciones
- **Usa**: 
  - Componentes de UI internos: `@/components/layout/Sidebar`, `@/components/layout/Header`.
  - Servicios internos: `@/lib/supabase/server` para autenticación y base de datos.
  - Librerías externas: `lucide-react` (iconos), `next/font/google` (tipografía Inter).
- **Usado por**: Next.js (Punto de entrada automático para el ruteo de la aplicación).

## Detalles clave
- **Ruteo Condicional por Sesión**: El `layout.js` verifica la autenticación del usuario (`supabase.auth.getUser()`) antes de cargar el Sidebar y el Header. Esto permite que la página de login tenga un diseño limpio mientras que el resto de la app mantiene la estructura de administración.
- **Dashboard Modular**: La vista principal (`page.js`) está estructurada mediante un sistema de grillas (`grid-cols-3`) que presenta un resumen rápido (KPIs) de las entidades más importantes del sistema logístico.
- **Subrutas Delegadas**: El enrutamiento de funcionalidades específicas (contenedores, clientes, calculadora, etiquetas, histórico, login) se delega a los subdirectorios, manteniendo la raíz limpia y enfocada en la vista general.