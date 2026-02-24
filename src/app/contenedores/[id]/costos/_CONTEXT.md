# 📁 src/app/contenedores/[id]/costos

## Propósito
Este directorio maneja la vista y la lógica para el cálculo de costos de importación de un contenedor específico. Permite visualizar, inicializar (basado en plantillas) y actualizar la matriz de costos asociada a las operaciones logísticas del contenedor.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Server Actions que gestionan la interacción con la base de datos para obtener, crear (usando plantillas o valores por defecto) y actualizar los cálculos y sus ítems. |
| `page.js` | Componente de servidor que actúa como página principal de la ruta, encargada de cargar los datos del contenedor, inicializar el cálculo y renderizar la interfaz con la calculadora. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (Cliente de base de datos), `@/lib/calculadora/defaults` (Constantes de matriz por defecto), `@/components/calculadora/CostMatrix` (Componente UI de la calculadora), `lucide-react` (Íconos).
- **Usado por**: Next.js App Router (Ruta accesible a través de la navegación de la app, típicamente desde la vista de detalle del contenedor en `/contenedores/[id]`).

## Detalles clave
- **Patrón "Get or Create"**: Al ingresar a la página, el sistema verifica si existe un cálculo previo. Si no existe, genera uno automáticamente basándose en una plantilla configurada en la base de datos (`cost_template_config`) o mediante un respaldo local (`DEFAULT_COST_MATRIX`).
- **Optimización de actualizaciones**: La acción de guardado (`saveFullCalculation`) actualiza los valores del contenedor (FOB) y utiliza `Promise.all` para procesar concurrentemente las actualizaciones de todos los ítems de costo modificados, mejorando el rendimiento.
- **Revalidación de caché**: Tras un guardado exitoso, se invoca `revalidatePath` para asegurar que la UI refleje los datos más recientes en el servidor.
- **Seguridad en Server Actions**: Se utiliza `.bind()` en el componente de servidor para pre-cargar el `containerId` y `calcId` en la función de guardado antes de pasarla al componente cliente, evitando exponer o manipular estos IDs desde el frontend.