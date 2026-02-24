# 📦 src/components/contenedores

## Propósito
Contiene los componentes de interfaz de usuario (UI) específicos para la presentación visual y el filtrado del listado de contenedores de logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| ContainerCard.js | Tarjeta individual que muestra un resumen visual de un contenedor (código, estado, origen, tipo, ETA) y actúa como enlace a su vista de detalle. |
| ContainerFilters.js | Componente de cliente que renderiza controles desplegables para filtrar la lista de contenedores por estado y almacén de origen, actualizando los parámetros de la URL. |

## Relaciones
- **Usa**: `@/components/ui/StatusBadge`, `@/lib/constants` (`WAREHOUSES`, `CONTAINER_STATES`), `next/link`, `next/navigation` (`useRouter`, `useSearchParams`), `lucide-react`.
- **Usado por**: Principalmente por las vistas dentro de `src/app/contenedores/` (ej. la página principal de listado).

## Detalles clave
- `ContainerFilters.js` utiliza el patrón de URL como estado (mediante `useSearchParams` y `useRouter`), permitiendo que los filtros se puedan compartir y mantener al recargar la página. Es un Client Component.
- `ContainerCard.js` formatea localmente las fechas de llegada estimada (ETA) utilizando el formato `es-AR`.
- El diseño y la lógica están fuertemente acoplados a las constantes del negocio definidas en `@/lib/constants`, asegurando consistencia en la visualización de banderas, etiquetas de almacenes y estados.