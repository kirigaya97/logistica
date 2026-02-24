# 📦 src/app/contenedores/[id]

## Propósito
Este directorio contiene la vista de detalle de un contenedor específico, permitiendo visualizar su información logística, gestionar su ciclo de vida (cambios de estado) y actuar como punto de entrada hacia herramientas especializadas como la calculadora de costos y el manejo de packing lists.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Server component que obtiene y renderiza los detalles del contenedor (origen, tipo, fechas, estado), e incluye acciones para avanzar su estado, eliminarlo y navegar a sus submódulos. |

## Relaciones
- **Usa**: 
  - `@/lib/supabase/server` para la obtención de datos del contenedor.
  - `@/lib/constants` para diccionarios estáticos de depósitos (`WAREHOUSES`), tipos (`CONTAINER_TYPES`) y estados (`CONTAINER_STATES`).
  - `@/app/contenedores/actions` para la mutación de datos (actualizar estado y eliminar).
  - Componentes de interfaz compartidos (`@/components/ui/StatusBadge`, `@/components/contenedores/DeleteContainerButton`).
- **Usado por**: Rutas de Next.js (App Router). Es accedido principalmente desde la vista de listado general en `/contenedores`.

## Detalles clave
- **Máquina de Estados Simple**: Implementa una lógica lineal de progresión de estados (`'deposito'` -> `'transito'` -> `'aduana'` -> `'finalizado'`) que calcula dinámicamente el siguiente estado posible.
- **Submódulos**: Contiene y da acceso a subdirectorios funcionales dependientes del ID del contenedor: `costos/` (Calculadora de Costos) y `packing-list/` (Gestión de inventario del contenedor).
- **Mutaciones con Server Actions**: Utiliza `Function.prototype.bind` para precargar el `id` y el estado siguiente en las server actions de actualización y eliminación dentro de los formularios.
- **Manejo de Errores Básicos**: Si el `id` no existe en la base de datos o hay un error en la consulta, se redirige automáticamente con `notFound()`.