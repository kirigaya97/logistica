# 🧩 src/components/ui

## Propósito
Este directorio contiene componentes de interfaz de usuario (UI) reutilizables y genéricos para toda la aplicación. Proporciona elementos estandarizados como botones, inputs y badges para mantener la consistencia visual y de comportamiento.

## Archivos
| Archivo | Descripción |
|---|---|
| `ExportButton.js` | Botón que maneja la exportación asíncrona de datos a un archivo Excel, incluyendo el estado de carga y la descarga automática. |
| `FileUpload.js` | Componente para la subida de archivos (principalmente `.xlsx`, `.xls`) que soporta arrastrar y soltar (drag & drop) o selección manual. |
| `StatusBadge.js` | Etiqueta visual (badge) que renderiza el estado de un contenedor con colores y textos predefinidos basados en constantes centralizadas. |
| `TagInput.js` | Input interactivo con autocompletado para buscar, seleccionar, remover y crear nuevas etiquetas (tags) en tiempo real. |

## Relaciones
- **Usa**: 
  - `lucide-react` (Iconografía)
  - `@/lib/utils/excelExport` (Lógica de generación de archivos Excel)
  - `@/lib/constants` (Definición de estados de contenedores)
  - `@/app/etiquetas/actions` (Server actions para buscar y crear etiquetas)
- **Usado por**: Múltiples componentes, formularios y páginas a lo largo de la aplicación (ej. vistas de contenedores, clientes, listas de empaque).

## Detalles clave
- **ExportButton**: Genera un `Blob` a partir de un buffer de datos y crea dinámicamente un enlace para forzar la descarga del archivo en el navegador del usuario, manejando posibles errores de forma segura.
- **FileUpload**: Incluye retroalimentación visual al arrastrar un archivo sobre el área activa y permite limpiar la selección actual.
- **StatusBadge**: Depende del mapeo `CONTAINER_STATES` de las constantes globales, garantizando que los colores y etiquetas sean siempre consistentes en toda la plataforma.
- **TagInput**: Implementa un "debounce" de 200ms para optimizar las llamadas de búsqueda, maneja el cierre del menú desplegable al hacer clic fuera del componente (click-outside) y permite la creación "inline" de nuevas etiquetas si no existen resultados exactos.