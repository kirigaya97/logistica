# 🏷️ src/app/etiquetas

## Propósito
Este módulo gestiona la visualización y administración de las etiquetas (tags) generadas al clasificar los ítems dentro de los packing lists. Provee la interfaz para listar el inventario de etiquetas y las operaciones de servidor necesarias para su gestión en la base de datos.

## Archivos
| Archivo | Descripción |
|---|---|
| actions.js | Define las Server Actions para el CRUD de etiquetas, incluyendo normalización de texto, búsqueda, y consultas complejas relacionales (conteo de ítems y detalles con contenedores). |
| page.js | Componente de página principal que renderiza una tabla con todas las etiquetas, mostrando su nombre normalizado, la cantidad de ítems que la utilizan y controles para su eliminación condicional. |

## Relaciones
- **Usa**: Cliente de Supabase (@/lib/supabase/server), caché de Next.js (next/cache) para revalidación de rutas, e íconos de lucide-react.
- **Usado por**: El enrutador de Next.js (como ruta /etiquetas). Las acciones de servidor (searchTags, createTag) muy probablemente sean consumidas por otros módulos interactivos como el componente de clasificación de ítems del packing list.

## Detalles clave
- Las etiquetas se someten a una estricta normalización antes de guardarse o buscarse (paso a minúsculas, eliminación de acentos y espacios extra) para asegurar consistencia y evitar duplicados.
- Se implementa una regla de seguridad en la UI y base de datos: las etiquetas solo exponen el botón de eliminación si no tienen ningún ítem asociado en el sistema (item_count === 0).
- Las consultas a la base de datos extraen información anidada profunda, permitiendo que una etiqueta conozca los ítems de packing list específicos y los contenedores a los que está vinculada.