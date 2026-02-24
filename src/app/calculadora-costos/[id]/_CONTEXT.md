# 📂 src/app/calculadora-costos/[id]

## Propósito
Este módulo se encarga de mostrar el detalle histórico de una simulación de costos específica. Permite visualizar de forma estática los valores, tributos y gastos calculados en el momento en que se guardó la simulación.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Página de servidor que obtiene una simulación por ID y renderiza un resumen ejecutivo y el desglose detallado en modo lectura. |

## Relaciones
- **Usa**: `@/app/calculadora-costos/actions.js` (para obtener datos), `@/components/calculadora/CostMatrix.js` (para visualizar el desglose), `lucide-react` (iconografía).
- **Usado por**: `src/app/calculadora-costos/page.js` (vía navegación desde el listado de simulaciones).

## Detalles clave
- **Modo Lectura**: Utiliza el componente `CostMatrix` con la propiedad `readOnly={true}`, impidiendo la edición de valores históricos.
- **Uso de Snapshots**: La lógica prioriza los datos capturados en el campo `snapshot` de la base de datos para garantizar que se visualicen los totales exactos calculados originalmente.
- **Resumen Ejecutivo**: Presenta tarjetas rápidas para FOB Total, Valor CIF, Base Imponible y Costo Total para una lectura ágil.
- **Validación**: Implementa redirecciones automáticas hacia el panel principal si la simulación solicitada no existe o carece de datos de captura (snapshot).