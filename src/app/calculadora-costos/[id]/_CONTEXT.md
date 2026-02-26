# 📂 src/app/calculadora-costos/[id]

## Propósito
Este módulo se encarga de la visualización detallada y estática de una simulación de costos previamente guardada. Permite consultar el historial de cálculos, impuestos y gastos operativos de una importación específica utilizando datos históricos (snapshots).

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Punto de entrada de la ruta dinámica que recupera la simulación por ID y la renderiza en modo lectura. |

## Relaciones
- **Usa**: 
    - `getSimulation` de `@/app/calculadora-costos/actions.js` para la obtención de datos.
    - `CostMatrix` de `@/components/calculadora/CostMatrix.js` para mostrar el desglose de costos en modo lectura.
    - `next/navigation` para manejar errores de carga mediante redirecciones.
- **Usado por**: Principalmente por la lista de simulaciones en la página principal de la calculadora de costos.

## Detalles clave
- **Inmutabilidad**: Utiliza el componente `CostMatrix` con la propiedad `readOnly={true}`, asegurando que los registros históricos no sean modificados accidentalmente.
- **Snapshot de Datos**: Depende de un objeto `snapshot` almacenado en la base de datos que contiene los valores calculados (FOB, CIF, base imponible, etc.) al momento de cerrar la simulación.
- **Conversión de Moneda**: Recupera y muestra el tipo de cambio (manual o automático) que estaba vigente cuando se realizó la simulación para calcular el costo proyectado en ARS.
- **Validación**: Implementa lógica de redirección hacia `/calculadora-costos` en caso de que el ID no sea válido o la simulación carezca de datos de snapshot.