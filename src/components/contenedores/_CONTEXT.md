Generaré el archivo `_CONTEXT.md` para el directorio de componentes de contenedores siguiendo el formato solicitado.

# 📁 src/components/contenedores

## Propósito
Este directorio contiene los componentes de interfaz de usuario especializados para la visualización, filtrado y gestión de contenedores de logística internacional en el dashboard.

## Archivos
| Archivo | Descripción |
|---|---|
| ContainerCard.js | Tarjeta informativa que resume los datos clave de un contenedor (código, origen, tipo, ETA) y vincula a su detalle. |
| ContainerFilters.js | Panel de filtros interactivos para segmentar la lista de contenedores por estado y almacén de origen mediante parámetros de URL. |
| DeleteContainerButton.js | Botón de acción con confirmación nativa para la eliminación lógica o física de un contenedor y sus datos relacionados. |

## Relaciones
- **Usa**: `next/link`, `next/navigation`, `@/components/ui/StatusBadge`, `@/lib/constants` (WAREHOUSES, CONTAINER_STATES), `lucide-react`.
- **Usado por**: Principalmente por las vistas en `src/app/contenedores/` (listado y páginas de detalle).

## Detalles clave
- **Navegación**: Utiliza `next/link` para transiciones rápidas entre el listado y el detalle de cada unidad.
- **Estado Global vía URL**: `ContainerFilters` sincroniza el estado de la interfaz con la query string de la URL, permitiendo compartir búsquedas filtradas.
- **UI Consistente**: Depende de constantes centralizadas (`WAREHOUSES`, `CONTAINER_STATES`) para asegurar que las etiquetas y banderas coincidan en toda la aplicación.
- **Seguridad de Acción**: El botón de eliminación implementa una barrera de confirmación para prevenir borrados accidentales de registros críticos.