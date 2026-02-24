# 📦 src/components/packing-list

## Propósito
Este directorio contiene los componentes de React responsables de la gestión, importación y clasificación de los items de un packing list asociado a un contenedor logístico. Permite cargar datos desde archivos Excel, mapear las columnas dinámicamente, clasificar los items asignándoles clientes y etiquetas, y visualizar o eliminar los registros.

## Archivos
| Archivo | Descripción |
|---|---|
| ColumnMapper.js | Interfaz para mapear las columnas detectadas en un archivo Excel con los campos del sistema (nombre, cantidad, peso, dimensiones, volumen) e incluye una vista previa de los datos. |
| ItemClassifier.js | Tabla interactiva con soporte para selección múltiple, que permite asignar clientes o etiquetas a varios items en lote (bulk actions). |
| PackingListImporter.js | Componente orquestador del flujo completo de importación, manejando los estados de carga, mapeo de columnas, importación a base de datos y confirmación de éxito. |
| PackingListTable.js | Tabla para visualizar el listado completo de items importados del packing list. Incluye cálculos automáticos de totales (cantidad, peso, volumen) y permite la eliminación individual de items. |

## Relaciones
- **Usa**: `@/lib/excel/parser` (procesamiento de Excel), `@/components/ui` (componentes reutilizables como `FileUpload` y `TagInput`), y Server Actions desde `@/app/contenedores/[id]/packing-list/actions` y `@/app/clientes/actions`.
- **Usado por**: Páginas de la aplicación, principalmente aquellas dentro de la ruta `src/app/contenedores/[id]/packing-list/`.

## Detalles clave
- **Flujo de importación guiado**: `PackingListImporter` divide la importación en 4 pasos claros (`upload`, `mapping`, `importing`, `done`) mejorando la experiencia de usuario.
- **Mapeo inteligente**: `ColumnMapper` confía en una función de auto-detección (`autoDetectMapping`) para sugerir el mapeo de columnas, pero valida estrictamente que los campos requeridos (nombre y cantidad) estén mapeados antes de permitir continuar.
- **Gestión de estado optimizada**: `ItemClassifier` facilita la carga de trabajo del usuario permitiendo acciones masivas (asignar clientes y etiquetas a múltiples items a la vez).
- **Delegación en Server Actions**: Todos los componentes son marcados con `'use client'` para manejar la interactividad local (estados, selecciones, flujos UI), pero delegan la mutación y consulta directa de datos a Server Actions importados, siguiendo las convenciones modernas de Next.js App Router.