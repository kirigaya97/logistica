# 📂 src/app/clientes/[id]

## Propósito
Este directorio contiene la página de detalle y edición de un cliente específico en el sistema. Permite visualizar la información completa de un cliente por su ID, acceder a su historial, modificar sus datos y eliminarlo.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de servidor (Server Component) que renderiza los detalles del cliente, maneja la vista de edición mediante parámetros en la URL y enlaza las acciones de servidor para actualizar o eliminar al cliente. |

## Relaciones
- **Usa**: 
  - `@/lib/supabase/server` (Cliente de base de datos)
  - `next/navigation` (Manejo de rutas y redirecciones 404)
  - `@/app/clientes/actions` (Acciones de servidor: `getClientWithHistory`, `updateClientAction`, `deleteClientAction`)
  - `@/components/clientes/ClientForm` (Componente de formulario de edición)
  - `@/components/clientes/ClientSummary` (Componente de resumen de información)
  - `lucide-react` (Iconografía)
- **Usado por**: Enrutador de Next.js (App Router) al acceder a la ruta de un cliente específico (`/clientes/[id]`).

## Detalles clave
- **Obtención de datos en el servidor**: La página realiza la carga de datos (`getClientWithHistory`) directamente en el servidor antes de renderizar.
- **Estados mediante URL**: Utiliza el parámetro de búsqueda en la URL (`?edit=true`) para alternar fluidamente entre la vista de resumen y el formulario de edición sin necesidad de gestionar estado local adicional.
- **Server Actions**: Vincula (`bind`) el `id` del cliente a las acciones de actualización y eliminación para que puedan ser consumidas directamente por los formularios.
- **Validación**: Implementa `notFound()` si el ID proporcionado no corresponde a ningún cliente válido.