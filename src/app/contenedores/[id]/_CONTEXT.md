# 📁 src/app/contenedores/[id]

## Propósito
Este directorio maneja la ruta dinámica para la vista de detalle de un contenedor individual. Permite visualizar toda la información asociada al contenedor y gestionar su ciclo de vida mediante acciones de actualización de estado y eliminación.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de servidor (Server Component) que obtiene los datos del contenedor desde Supabase, renderiza su información detallada y provee formularios con Server Actions para modificar su estado o eliminarlo. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (cliente de base de datos), `@/components/ui/StatusBadge` (componente de UI para el estado), `@/lib/constants` (diccionarios de datos estáticos), `@/app/contenedores/actions` (Server Actions) y `lucide-react` (iconos).
- **Usado por**: El enrutador de Next.js al navegar a `/contenedores/[id]` (típicamente desde el listado de contenedores).

## Detalles clave
- **Máquina de estados lineal**: Implementa una progresión de estados estricta y predefinida (`deposito` -> `transito` -> `aduana` -> `finalizado`), calculando automáticamente el siguiente estado posible.
- **Server Actions con `bind`**: Utiliza `Function.prototype.bind` para pre-cargar los argumentos (`id` y `nextStatus`) en las Server Actions directamente dentro del componente, manteniendo los formularios simples.
- **Formateo localizado**: Las fechas estimadas de salida (ETD) y llegada (ETA) se formatean específicamente para el locale argentino (`es-AR`).
- **Manejo de errores**: Si la consulta a Supabase falla o no retorna un contenedor, redirige automáticamente a la página de no encontrado mediante `notFound()`.