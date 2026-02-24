# 🏷️ src/app/etiquetas

## Propósito
Este directorio contiene la interfaz de usuario y la lógica de servidor para la administración de etiquetas (tags). Las etiquetas sirven para clasificar de manera flexible los ítems dentro de los packing lists de los contenedores logísticos.

## Archivos
| Archivo | Descripción |
|---|---|
| actions.js | Acciones de servidor (Server Actions) que manejan el CRUD de etiquetas en Supabase, incluyendo algoritmos de normalización de texto y consultas relacionales para contabilizar ítems y contenedores asociados. |
| page.js | Componente de servidor que renderiza la vista principal de etiquetas. Muestra una tabla con el listado completo, estadísticas de uso por etiqueta y permite eliminarlas de forma segura. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (Cliente de base de datos), `next/cache` (Manejo de caché de Next.js), y la librería de iconos `lucide-react`.
- **Usado por**: El layout de navegación principal (para acceder a la ruta `/etiquetas`). Las acciones expuestas (como `searchTags` o `createTag`) muy probablemente son consumidas por los componentes de clasificación dentro de los packing lists.

## Detalles clave
- **Normalización estricta**: Antes de guardar o buscar, los nombres de las etiquetas se normalizan (`normalizeTagName`) eliminando acentos, espacios múltiples y convirtiéndolos a minúsculas. Esto previene la duplicación de datos (ej. "Electrónica" y "electronica" se tratan como la misma etiqueta).
- **Borrado seguro**: Por reglas de negocio y seguridad en la UI, una etiqueta solo puede ser eliminada si no tiene ningún ítem asociado (`item_count === 0`).
- **Consultas profundas (Deep joins)**: La función `getTagsWithItemCount` realiza una consulta relacional compleja a través de Supabase que atraviesa `tags -> item_tags -> packing_list_items -> packing_lists -> containers` para derivar exactamente en qué contenedores se usa cada etiqueta.
- **Mutaciones sin estado cliente**: Todo el flujo de modificación de datos (como el borrado) utiliza Server Actions combinados con `revalidatePath('/etiquetas')`, evitando la necesidad de manejar estados complejos en el cliente para mantener la tabla actualizada.