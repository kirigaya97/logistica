# 📦 src/components/packing-list

## Propósito
Este directorio contiene los componentes de interfaz de usuario responsables de la importación, visualización, clasificación y gestión de los ítems de un packing list asociado a un contenedor logístico.

## Archivos
| Archivo | Descripción |
|---|---|
| ColumnMapper.js | Interfaz para mapear las columnas de un archivo Excel subido a los campos requeridos por el sistema, incluyendo una vista previa de los datos. |
| ItemClassifier.js | Componente para la gestión avanzada de ítems: permite selección múltiple, asignación masiva de clientes y etiquetas, y la creación manual o eliminación de ítems. |
| PackingListImporter.js | Orquesta el flujo de tres pasos para la importación desde Excel: carga del archivo, confirmación del mapeo de columnas y ejecución de la importación. |
| PackingListTable.js | Tabla para visualizar el listado de ítems importados, incluyendo el cálculo automático de totales para cantidades, peso y volumen al final de la misma. |

## Relaciones
- **Usa**: Utilidades de parseo de Excel (`@/lib/excel/parser`), componentes de interfaz comunes (`@/components/ui/`), Server Actions para contenedores y clientes (`@/app/contenedores/[id]/packing-list/actions`, `@/app/clientes/actions`), y dependencias externas como `lucide-react`.
- **Usado por**: Principalmente por la vista de gestión de packing list de un contenedor específico (probablemente `src/app/contenedores/[id]/packing-list/page.js`).

## Detalles clave
- **Acciones en Lote**: `ItemClassifier` implementa una interfaz robusta con soporte para selección múltiple (incluyendo selección de rangos con Shift) para aplicar clientes o etiquetas a varios ítems simultáneamente.
- **Interacción con el Servidor**: Todas las mutaciones de datos (borrado, asignación de etiquetas/clientes, creación manual) se delegan a Server Actions de Next.js.
- **Flujo de Importación Resiliente**: `PackingListImporter` maneja los estados de carga, mapeo y éxito/error, apoyándose en la auto-detección de mapeo proporcionada por `ColumnMapper`.
- **Exportación Integrada**: Se incluye funcionalidad para exportar el listado procesado utilizando el componente `ExportButton`.