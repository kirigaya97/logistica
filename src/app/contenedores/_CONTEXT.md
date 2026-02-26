# 📦 src/app/contenedores

## Propósito
Este módulo centraliza la gestión de contenedores de logística internacional, permitiendo el listado, filtrado, creación, edición y seguimiento de estados de las unidades de carga.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Acciones de servidor para el CRUD de contenedores, validación con Zod y lógica de generación de códigos. |
| `page.js` | Página principal que renderiza el listado de contenedores con soporte para filtros dinámicos y exportación. |

## Relaciones
- **Usa**: `@/lib/supabase/server`, `@/components/contenedores/ContainerCard`, `@/components/contenedores/ContainerFilters`, `@/components/ui/ExportButton`, `zod`, `next/cache`, `next/navigation`.
- **Usado por**: Navegación principal del sistema (Sidebar/Header).

## Detalles clave
- **Generación de Códigos**: Incluye una función `generateCode` que crea identificadores únicos basados en el origen y el año actual (ej: `HK-2026-001`).
- **Validación de Datos**: Utiliza `zod` para asegurar que los pesos, tipos de contenedor (40HC, 40ST) y almacenes de origen sean válidos antes de impactar la base de datos.
- **Filtrado Server-side**: La página principal procesa `searchParams` para filtrar por estado y origen directamente en la consulta a Supabase.
- **Sincronización de UI**: Implementa `revalidatePath` en todas las acciones de escritura para asegurar que los cambios se reflejen inmediatamente en el listado y el detalle.
- **Exportación**: Integra un botón de exportación que genera reportes en formato Excel a partir de los datos filtrados actualmente.

## Subdirectorios
- `nuevo/`: Formulario y lógica para la creación de nuevos contenedores.
- `[id]/`: Vista de detalle, edición, gestión de costos y packing list de un contenedor específico.