# 📁 src/app/contenedores/[id]

## Propósito
Este directorio maneja la vista de detalle dinámico para un contenedor específico. Centraliza la información del contenedor, muestra un resumen de la carga por cliente, y actúa como punto de acceso para la gestión de su packing list y la calculadora de costos asociada.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Página principal que renderiza los detalles del contenedor. Obtiene datos de Supabase (contenedor, ítems, costos), calcula el volumen por cliente, maneja la edición en línea y orquesta las acciones de cambio de estado o eliminación. |
| `costos/` | (Subdirectorio) Contiene la lógica y vistas para la calculadora de costos específica de este contenedor. |
| `packing-list/` | (Subdirectorio) Contiene la interfaz y lógica para gestionar la lista de empaque (ítems) asignada a este contenedor. |

## Relaciones
- **Usa**: 
  - `@/lib/supabase/server` (consultas a la base de datos).
  - `@/app/contenedores/actions` (Server Actions para actualizar estado o eliminar).
  - `@/components/contenedores/*` (componentes modulares como `ContainerEditForm`, `DeleteContainerButton`, `RevertStatusButton`).
  - `@/components/ui/*` (componentes base como `StatusBadge`, `ExportButton`).
  - `@/lib/constants` (diccionarios estáticos: `WAREHOUSES`, `CONTAINER_TYPES`, `CONTAINER_STATES`).
- **Usado por**: Navegación de Next.js. Accedido principalmente desde el listado general en `/contenedores`.

## Detalles clave
- **Máquina de estados simple:** Implementa un flujo lineal para el ciclo de vida del contenedor (`deposito` -> `transito` -> `aduana` -> `finalizado`), permitiendo avanzar o retroceder de estado mediante acciones del servidor.
- **Agrupación dinámica:** Calcula en tiempo de ejecución (`customerBoard`) el volumen total y la cantidad de ítems agrupados por cliente para mostrar el panel "Clientes a bordo".
- **Exportación integral:** Prepara un objeto `fullExportData` que consolida la cabecera del contenedor, todos sus ítems del packing list y sus costos para ser exportados globalmente a través del componente `ExportButton`.
- **Soporte de edición in-line:** Utiliza parámetros de búsqueda en la URL (`?edit=true`) para alternar entre el modo de visualización y el formulario de edición de la cabecera del contenedor sin cambiar de ruta.