# 📁 src/app/contenedores

## Propósito
Este directorio maneja la ruta principal y las operaciones de servidor para la gestión de contenedores logísticos. Permite listar, filtrar, crear, actualizar el estado y eliminar los contenedores del sistema.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Define las Server Actions para interactuar con Supabase (crear, actualizar estado, eliminar), incluyendo validación de datos y la lógica para la generación automática de códigos únicos. |
| `page.js` | Componente de servidor (Server Component) que renderiza la vista principal. Se encarga de obtener los contenedores desde la base de datos, aplicar filtros según los parámetros de búsqueda y mostrar la cuadrícula de resultados. |

## Relaciones
- **Usa**: `@/lib/supabase/server` para la conexión a la base de datos, `@/components/contenedores` para componentes de interfaz (`ContainerCard`, `ContainerFilters`), `zod` para validación de esquemas, y utilidades de Next.js (`next/cache`, `next/navigation`).
- **Usado por**: El App Router de Next.js como la ruta `/contenedores`.

## Detalles clave
- **Generación de códigos**: Al crear un nuevo contenedor, se genera automáticamente un código correlativo con el formato `[ORIGEN]-[AÑO]-[SECUENCIA]` (ej. `HK-2024-001`).
- **Validación de datos**: Se utiliza `zod` en las acciones de servidor para validar estrictamente los datos del formulario antes de insertarlos en la base de datos.
- **Obtención de datos en servidor**: `page.js` realiza las consultas a Supabase directamente en el servidor, utilizando `searchParams` para aplicar filtros dinámicos (estado, origen).
- **Revalidación de caché**: Las acciones que mutan datos (`createContainer`, `updateContainerStatus`, `deleteContainer`) utilizan `revalidatePath` para asegurar que la interfaz de usuario refleje los cambios inmediatamente.