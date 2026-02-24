# 📦 src/app/contenedores

## Propósito
Este directorio contiene las vistas y la lógica del servidor (App Router) para la gestión principal de contenedores logísticos internacionales. Permite listar, filtrar, crear, actualizar el estado y eliminar registros de contenedores en el sistema.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Server actions para mutaciones de contenedores (crear, actualizar estado, eliminar). Incluye validación de datos y generación de códigos secuenciales. |
| `page.js` | Página principal que renderiza el listado de contenedores. Consume datos de Supabase e integra componentes de filtrado y visualización. |
| `nuevo/` | Subdirectorio que contiene la página y formulario para registrar un nuevo contenedor. |
| `[id]/` | Subdirectorio con la página de detalle y gestión específica de un contenedor individual. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (cliente de base de datos), componentes de interfaz (`ContainerCard`, `ContainerFilters`), utilidades nativas de Next.js (`next/cache`, `next/navigation`), `zod` para validación de esquemas y `lucide-react` para iconografía.
- **Usado por**: Sistema de enrutamiento de Next.js (App Router) y la navegación general de la aplicación.

## Detalles clave
- **Mutaciones Seguras**: Utiliza Server Actions (`'use server'`) para procesar formularios y operaciones de base de datos sin exponer lógica al cliente.
- **Generación de Códigos**: Implementa un algoritmo para auto-generar códigos únicos por contenedor con el formato `[ORIGEN]-[AÑO]-[SECUENCIA_DE_3_DÍGITOS]` (ej: `HK-2024-001`).
- **Validación Estricta**: Emplea `zod` para asegurar la integridad de los datos antes de insertarlos, restringiendo orígenes (`HK`, `CH`, `USA`) y tipos (`20`, `40`, `40HC`).
- **Sincronización de UI**: Hace uso de `revalidatePath` tras cada mutación para purgar la caché y reflejar los cambios instantáneamente en la interfaz.
- **Filtrado por URL**: El listado de contenedores aplica filtros de forma dinámica leyendo los `searchParams` (`status` y `origin`) provenientes de la URL.