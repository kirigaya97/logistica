# 📁 src/app/contenedores/[id]/costos

## Propósito
Gestiona la vista y las operaciones de cálculo de costos de importación asociados a un contenedor específico. Se encarga de inicializar, mostrar y permitir la actualización de la matriz de costos.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Server actions para interactuar con Supabase, encargadas de obtener, crear (con valores por defecto) y actualizar los cálculos y los ítems de costo de un contenedor. |
| `page.js` | Componente de servidor (Server Component) de Next.js que obtiene los datos del contenedor, asegura la existencia de un cálculo de costos y renderiza la interfaz principal a través del componente `CostMatrix`. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (cliente de base de datos), `@/lib/calculadora/defaults` (constantes de costos por defecto) y `@/components/calculadora/CostMatrix` (componente de UI para la matriz).
- **Usado por**: Enrutador de Next.js (App Router) al acceder a la ruta `/contenedores/[id]/costos`.

## Detalles clave
- **Inicialización Lazy**: El método `getOrCreateCalculation` implementa un patrón donde, si no existe un cálculo de costos para el contenedor al acceder a la ruta, se crea uno automáticamente basándose en `DEFAULT_COST_MATRIX`.
- **Mutaciones del lado del servidor**: La actualización de los ítems de costo, tanto individual como en lote, se maneja de forma segura mediante Server Actions.
- **Validación de existencia**: La página verifica que el contenedor exista antes de proceder, devolviendo un error 404 (`notFound()`) en caso contrario.