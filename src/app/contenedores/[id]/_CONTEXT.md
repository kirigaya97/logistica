# 📂 src/app/contenedores/[id]

## Propósito
Este directorio gestiona la vista de detalle, edición y control de flujo de un contenedor específico. Actúa como el centro de mando para supervisar los clientes a bordo, el estado logístico y el acceso a la documentación (packing list) y finanzas (costos).

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Componente de servidor principal que recupera la información del contenedor, calcula el resumen por cliente y coordina las acciones de gestión. |

## Relaciones
- **Usa**: `@src/lib/supabase/server.js`, `@src/app/contenedores/actions.js`, `@src/components/ui/StatusBadge.js`, `@src/components/ui/ExportButton.js`, `@src/components/contenedores/`, `@src/lib/constants.js`.
- **Usado por**: El listado general de contenedores en `/src/app/contenedores/`.

## Detalles clave
- **Ciclo de Vida**: Gestiona la transición entre estados logísticos (`deposito`, `transito`, `aduana`, `finalizado`) permitiendo avanzar o revertir según el progreso real.
- **Interfaz Dual**: Alterna entre la visualización de datos y el formulario de edición (`ContainerEditForm`) basado en la presencia del query parameter `?edit=true`.
- **Panel de Clientes**: Realiza una agregación dinámica de los ítems del Packing List para mostrar qué clientes tienen carga en el contenedor y cuánto volumen (`m3`) ocupan.
- **Consolidación de Exportación**: Prepara un objeto de datos integral que incluye metadatos del contenedor, ítems y costos para su exportación a Excel.
- **Navegación Contextual**: Provee accesos directos a los sub-módulos de `/costos` y `/packing-list` manteniendo la referencia del ID del contenedor actual.