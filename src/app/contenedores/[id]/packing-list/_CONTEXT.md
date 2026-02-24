# 📁 src/app/contenedores/[id]/packing-list

## Propósito
Este directorio contiene la página y las acciones de servidor dedicadas a la gestión, importación y clasificación del "Packing List" (lista de empaque) de un contenedor específico. Facilita la carga de los ítems y su posterior vinculación con clientes y etiquetas.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Funciones de servidor (Server Actions) para interactuar con Supabase, manejando la creación, lectura, actualización y eliminación (CRUD) de packing lists, ítems, y su clasificación (clientes y etiquetas). |
| `page.js` | Componente de página (Server Component) que estructura la vista del packing list, integrando el importador de archivos y la tabla de clasificación de ítems obtenidos desde la base de datos. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (cliente de base de datos), `next/cache` y `next/navigation` (revalidación y redirección en Next.js), y componentes de UI (`@/components/packing-list/PackingListImporter`, `@/components/packing-list/ItemClassifier`).
- **Usado por**: El App Router de Next.js al resolver la ruta `/contenedores/[id]/packing-list`.

## Detalles clave
- **Importación destructiva**: Al usar `importPackingList`, si ya existe un packing list para el contenedor, este y sus ítems son eliminados antes de insertar los nuevos datos, manteniendo una única versión por contenedor.
- **Clasificación de ítems**: Permite la asignación masiva o individual de un cliente (`client_id`) y múltiples etiquetas (`tags`) a los ítems importados, facilitando la organización de la carga.
- **Manejo de conflictos**: Se utiliza el método `upsert` de Supabase al relacionar ítems con etiquetas para prevenir errores de clave única por duplicidad.
- **Flujo de datos**: La página actúa como un Server Component que obtiene todos los datos necesarios del contenedor y sus ítems clasificados de manera síncrona antes de renderizar los componentes interactivos del cliente.