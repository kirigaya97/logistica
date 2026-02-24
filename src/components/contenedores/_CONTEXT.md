# 📦 src/components/contenedores

## Propósito
Este directorio contiene los componentes de interfaz de usuario específicos para la gestión y visualización de contenedores logísticos. Incluye tarjetas de resumen, formularios de edición, filtros de búsqueda y botones para acciones de control de estado.

## Archivos
| Archivo | Descripción |
|---|---|
| ContainerCard.js | Tarjeta resumen que muestra la información principal de un contenedor (código, estado, origen, ETA y descripción) y sirve como enlace a su vista detallada. |
| ContainerEditForm.js | Formulario de cliente para editar los detalles de un contenedor (origen, tipo, fechas estimadas, descripción y notas), interactuando con las acciones del servidor. |
| ContainerFilters.js | Componente de cliente que permite filtrar la lista de contenedores por estado y almacén de origen, reflejando los filtros en los parámetros de la URL. |
| DeleteContainerButton.js | Botón con confirmación nativa del navegador para eliminar un contenedor y todos sus cálculos asociados. |
| RevertStatusButton.js | Botón de cliente que permite deshacer el cambio de estado de un contenedor y volver a un estado anterior específico mediante una acción de servidor. |

## Relaciones
- **Usa**: `@/components/ui/StatusBadge` (UI genérica), `@/lib/constants` (constantes de almacenes, tipos de contenedor y estados), `@/app/contenedores/actions` (Server Actions para actualizar y revertir estados), `lucide-react` (iconos), y utilidades de enrutamiento de Next.js (`next/link`, `next/navigation`).
- **Usado por**: Principalmente por las vistas y layouts dentro de `src/app/contenedores/`.

## Detalles clave
- **Client Components**: La mayoría de los componentes (`ContainerEditForm`, `ContainerFilters`, `DeleteContainerButton`, `RevertStatusButton`) utilizan la directiva `'use client'` al depender de interactividad, hooks de React o manipulaciones de la URL.
- **Manejo de estado en URL**: `ContainerFilters` utiliza los parámetros de búsqueda (Search Params) de la URL como fuente de verdad para los filtros, permitiendo compartir enlaces con los filtros aplicados.
- **Prevención de errores**: Se utilizan alertas de confirmación nativas (`window.confirm`) para acciones destructivas o críticas, como la eliminación o reversión de estado de los contenedores.
- **Gestión centralizada de dominio**: Las listas de almacenes, estados de contenedor y tipos de contenedor no están "hardcodeadas", sino que se importan de un archivo central de constantes (`@/lib/constants`).