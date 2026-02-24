# 📦 src/components/calculadora

## Propósito
Este módulo provee los componentes de interfaz de usuario para realizar simulaciones de costos de importación y cálculos de capacidad volumétrica en contenedores.

## Archivos
| Archivo | Descripción |
|---|---|
| CostMatrix.js | Matriz interactiva que permite visualizar y editar el desglose de los costos (FOB, CIF, impuestos y gastos), agrupando los ítems por categoría. |
| ExchangeRateSelector.js | Componente para seleccionar entre distintas cotizaciones de moneda (Oficial, Blue, MEP, CCL) o ingresar un tipo de cambio de forma manual. |
| Simulator.js | Panel principal que integra la matriz de costos y gestiona el historial local de simulaciones (crear, listar y eliminar). |
| VolumetricCalc.js | Calculadora que determina la máxima cantidad de cajas que entran en un contenedor según sus dimensiones, considerando los límites físicos tanto de volumen como de peso. |

## Relaciones
- **Usa**: `@/lib/calculadora/engine`, `@/lib/calculadora/defaults`, `@/lib/calculadora/volumetric`, `@/lib/constants`, `@/hooks/useExchangeRate`, `@/app/calculadora-costos/actions`, `@/components/ui/ExportButton`, `lucide-react`.
- **Usado por**: Por determinar (típicamente páginas de aplicación como `src/app/calculadora-costos/page.js` o `src/app/calculadora-volumetrica/page.js`).

## Detalles clave
- `CostMatrix` calcula dinámicamente los totales (FOB, CIF, Base Imponible, Tributos, etc.) usando el motor centralizado mientras el usuario altera valores en la tabla.
- `VolumetricCalc` incorpora validación estricta y alertas visuales si la cantidad de cajas supera el peso máximo del contenedor, priorizando el límite de peso por sobre el volumen si corresponde.
- `Simulator` delega la persistencia del estado en el backend utilizando Server Actions (`saveSimulation`, `deleteSimulation`).
- El diseño general está enfocado en dar feedback visual rápido ante cambios, mostrando cargas asíncronas e indicadores de límites físicos en logística operativa.