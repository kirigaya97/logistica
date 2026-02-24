# 📦 src/app/contenedores

## Propósito
Este módulo centraliza la gestión de contenedores internacionales, permitiendo su visualización, filtrado por estado u origen, creación de nuevas unidades y administración de su ciclo de vida logístico.

## Archivos
| Archivo | Descripción |
|---|---|
| actions.js | Acciones de servidor para operaciones CRUD, cambios de estado y lógica de generación de códigos correlativos. |
| page.js | Página principal que renderiza el listado de contenedores, integrando filtros dinámicos y exportación a Excel. |
| [id]/ | Subdirectorio para la visualización detallada y edición de un contenedor específico. |
| nuevo/ | Subdirectorio que contiene el formulario para el alta de nuevos contenedores. |

## Relaciones
- **Usa**: `@/lib/supabase/server`, `@/components/contenedores/ContainerCard`, `@/components/contenedores/ContainerFilters`, `@/components/ui/ExportButton`, `zod`, `next/cache`, `next/navigation`.
- **Usado por**: Navegación principal de la aplicación y flujos de gestión de carga.

## Detalles clave
- **Generación de Códigos**: Implementa una lógica automática para crear códigos únicos basados en el prefijo del almacén (HK, CH, USA), el año actual y un secuencial de tres dígitos.
- **Validación**: Utiliza `zod` para garantizar la integridad de los datos (almacén, tipo de contenedor, fechas) antes de persistir en Supabase.
- **Estados Dinámicos**: Permite actualizar y revertir el estado de los contenedores, disparando revalidaciones de ruta para mantener la interfaz sincronizada.
- **Filtros por URL**: La lista principal responde a `searchParams` (`status`, `origin`), permitiendo compartir vistas filtradas mediante la URL.
- **Exportación**: Integra un componente de exportación que genera reportes en formato Excel basados en los datos filtrados actualmente.