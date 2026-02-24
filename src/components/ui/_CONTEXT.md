Voy a generar el archivo `_CONTEXT.md` para el directorio de componentes de interfaz de usuario, detallando la funcionalidad de carga de archivos, gestión de etiquetas y visualización de estados.

# 🎨 src/components/ui

## Propósito
Este directorio contiene componentes de interfaz de usuario reutilizables y atómicos que proporcionan funcionalidades transversales como la carga de archivos, la gestión de etiquetas y la visualización de estados consistentes en toda la aplicación de logística.

## Archivos
| Archivo | Descripción |
|---|---|
| `FileUpload.js` | Componente de carga de archivos con soporte para arrastrar y soltar (Drag & Drop), optimizado para archivos Excel. |
| `StatusBadge.js` | Etiqueta visual que muestra el estado actual de un contenedor utilizando el sistema de colores definido en las constantes. |
| `TagInput.js` | Selector dinámico de etiquetas que permite buscar, seleccionar y crear nuevas categorías en tiempo real con autocompletado. |

## Relaciones
- **Usa**: `lucide-react` (iconografía), `@/lib/constants` (definiciones de estados), `@/app/etiquetas/actions` (Server Actions para persistencia de etiquetas).
- **Usado por**: Componentes de mayor nivel como `PackingListImporter`, `ClientForm`, `ContainerCard` y diversas vistas en `src/app/`.

## Detalles clave
- **FileUpload**: Implementa retroalimentación visual según el estado de la carga (arrastrando, archivo seleccionado o vacío) y restringe por defecto los formatos a `.xlsx` y `.xls`.
- **StatusBadge**: Centraliza la lógica de estilos de estados; cualquier cambio en los colores de `CONTAINER_STATES` se refleja automáticamente aquí.
- **TagInput**: Incluye una lógica de búsqueda con *debounce* de 200ms para optimizar las peticiones al servidor y permite la creación rápida de etiquetas mediante la tecla "Enter".
- **Estética**: Todos los componentes utilizan Tailwind CSS y siguen una línea visual limpia basada en bordes redondeados (`rounded-xl`/`rounded-lg`) y tipografía legible de tamaño pequeño/mediano.