# 📦 src/app/contenedores

## Propósito
Este directorio contiene la página principal y las acciones de servidor para la gestión del listado de contenedores logísticos. Permite visualizar, filtrar, exportar y administrar el estado general de los contenedores en el sistema.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Acciones de servidor (Server Actions) para crear, actualizar, eliminar y cambiar el estado de los contenedores, incluyendo la lógica de generación automática de códigos secuenciales. |
| `page.js` | Página principal (Server Component) que consulta y muestra el listado de contenedores, integrando filtros por URL, opciones de exportación y navegación hacia la creación de nuevos registros. |
| `nuevo/` | (Subdirectorio) Contiene la ruta y vista para la creación de un nuevo contenedor. |
| `[id]/` | (Subdirectorio) Contiene la ruta dinámica y vistas de detalle para un contenedor individual. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (Conexión a base de datos), `next/cache` y `next/navigation` (Manejo de caché y ruteo de Next.js), `zod` (Validación de esquemas), `@/components/contenedores/` (Componentes específicos de UI como `ContainerCard` y `ContainerFilters`), `@/components/ui/` (Componentes compartidos como `ExportButton`), `lucide-react` (Iconos).
- **Usado por**: Ruteo principal de Next.js (punto de entrada para la URL `/contenedores`).

## Detalles clave
- **Generación automática de códigos**: La función `generateCode` en `actions.js` crea un identificador único y secuencial para cada nuevo contenedor basándose en su origen y el año actual (por ejemplo: `HK-2024-001`).
- **Filtrado Server-Side**: Los filtros por estado y origen se aplican directamente en la consulta a Supabase mediante la lectura de `searchParams` en `page.js`, optimizando la carga de datos.
- **Mutaciones optimizadas**: Las acciones de servidor utilizan `revalidatePath` para refrescar la caché de Next.js inmediatamente después de crear, actualizar o eliminar un contenedor, garantizando que la interfaz siempre muestre información actualizada.
- **Validación de datos**: Se utiliza `zod` en el backend (`actions.js`) para asegurar que los datos enviados desde los formularios cumplen con la estructura y los tipos esperados (origen, tipo de contenedor, etc.) antes de interactuar con la base de datos.