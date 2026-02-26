# 📦 src/components/contenedores

## Propósito
Este directorio contiene los componentes de interfaz de usuario especializados para la visualización, filtrado y edición de contenedores dentro del sistema de logística.

## Archivos
| Archivo | Descripción |
|---|---|
| ContainerCard.js | Tarjeta resumen que muestra información clave de un contenedor (código, estado, origen y ETA). |
| ContainerEditForm.js | Formulario cliente para la edición integral de los metadatos y configuración técnica de un contenedor. |
| ContainerFilters.js | Panel de filtros que interactúa con la URL para segmentar contenedores por estado y depósito de origen. |
| DeleteContainerButton.js | Botón de acción con confirmación nativa para la eliminación de un contenedor y sus registros asociados. |
| RevertStatusButton.js | Botón de acción para retroceder el estado del flujo logístico de un contenedor específico. |

## Relaciones
- **Usa**: `next/link`, `next/navigation`, `lucide-react`, `@/components/ui/StatusBadge`, `@/lib/constants`, `@/app/contenedores/actions`.
- **Usado por**: Principalmente por las páginas de listado (`src/app/contenedores/page.js`) y detalle (`src/app/contenedores/[id]/page.js`).

## Detalles clave
- **Sincronización de URL**: `ContainerFilters` utiliza los hooks de navegación de Next.js para persistir el estado del filtrado en la query string.
- **Integración con Server Actions**: Los componentes de edición y acción (revertir/eliminar) consumen directamente las funciones del servidor para la mutación de datos.
- **Feedback de Usuario**: Se implementan estados de carga local (`loading`) y confirmaciones nativas para acciones destructivas o cambios de estado críticos.
- **Estandarización**: El renderizado de etiquetas y flags de países se centraliza mediante las constantes de `WAREHOUSES` y el componente `StatusBadge`.