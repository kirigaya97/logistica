# 📁 src/app/clientes/[id]

## Propósito
Este directorio maneja la ruta dinámica para ver y gestionar los detalles de un cliente específico. Permite visualizar la información del cliente, sus estadísticas históricas de operaciones, y proporciona la interfaz para editar sus datos o eliminar el registro.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de servidor que renderiza la página de detalle del cliente, incluyendo tarjetas de información, estadísticas y el manejo condicional del modo de edición. |

## Relaciones
- **Usa**: 
  - Acciones de servidor (`@/app/clientes/actions`): `getClientWithHistory`, `updateClientAction`, `deleteClientAction`.
  - Componentes de interfaz (`@/components/clientes`): `ClientForm`, `ClientSummary`.
  - Herramientas de Next.js (`next/navigation`, `next/link`) e íconos (`lucide-react`).
- **Usado por**: Enrutador de Next.js (App Router) al acceder a la ruta `/clientes/[id]`.

## Detalles clave
- **Edición contextual**: Utiliza parámetros de búsqueda en la URL (`?edit=true`) para alternar fluidamente entre la vista de solo lectura y el formulario de edición sin cambiar de ruta.
- **Server Actions vinculadas**: Las acciones de actualización y eliminación se vinculan (bind) con el `id` del cliente directamente en el componente de servidor para su uso seguro en formularios.
- **Agregación de datos**: Renderiza estadísticas históricas pre-calculadas como la cantidad de contenedores operados, volumen total y un listado de etiquetas únicas utilizadas.
- **Validación de existencia**: Implementa `notFound()` si el `id` proporcionado no corresponde a un cliente válido en la base de datos.