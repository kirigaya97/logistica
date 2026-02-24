# 📂 src/app/contenedores/[id]/packing-list

## Propósito
Este módulo gestiona la visualización, importación y clasificación detallada (por cliente y etiquetas) de los items del packing list correspondientes a un contenedor específico.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Contiene las Server Actions para interactuar con la base de datos (Supabase). Maneja la lógica de importación, operaciones CRUD de items, recálculo de totales volumétricos y de peso, y la asignación de clientes y etiquetas a los items. |
| `page.js` | Componente de página principal (Server Component) que obtiene los datos del contenedor y su packing list para renderizar la interfaz de usuario, incluyendo el importador y la tabla de clasificación. |

## Relaciones
- **Usa**: `@/lib/supabase/server`, `@/components/packing-list/PackingListImporter`, `@/components/packing-list/ItemClassifier`, `next/cache`, `next/navigation`, `lucide-react`.
- **Usado por**: Enrutador de Next.js (App Router) como ruta dinámica para la vista de packing list de un contenedor.

## Detalles clave
- **Reemplazo en Importación**: Al importar un nuevo packing list, la lógica elimina completamente el existente y sus items previos antes de insertar los nuevos, asegurando que no haya datos huérfanos.
- **Recálculo Automático**: Incluye lógica para actualizar automáticamente los totales de peso y volumen del packing list tras adiciones o eliminaciones manuales de items.
- **Sistema de Clasificación**: Permite asignar un cliente a los items y múltiples etiquetas (relación N:M manejada mediante `upsert` para evitar duplicados), lo cual es fundamental para organizar la carga.
- **Mutaciones con Server Actions**: Toda la modificación de datos se realiza a través de acciones de servidor, utilizando `revalidatePath` para refrescar la caché y la interfaz del usuario tras cada cambio.