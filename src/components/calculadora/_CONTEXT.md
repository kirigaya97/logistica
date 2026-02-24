# 📁 src/components/calculadora

## Propósito
Este directorio contiene los componentes interactivos de interfaz de usuario destinados a las herramientas de cálculo de la plataforma logística. Facilita la estimación dinámica de costos de importación, la selección de tipos de cambio y la planificación de capacidades volumétricas para contenedores.

## Archivos
| Archivo | Descripción |
|---|---|
| CostMatrix.js | Componente que renderiza una matriz interactiva para calcular y desglosar costos de importación (FOB, CIF, impuestos, gastos) en tiempo real. |
| ExchangeRateSelector.js | Componente para seleccionar cotizaciones de divisas (Oficial, Blue, MEP, CCL) consumiendo un hook, con soporte para valores manuales (override). |
| VolumetricCalc.js | Calculadora que determina la cantidad máxima de cajas, distribución, peso y volumen utilizable dentro de distintos tipos de contenedores, con validación de peso máximo. |

## Relaciones
- **Usa**: `@/lib/calculadora/engine`, `@/lib/calculadora/defaults`, `@/hooks/useExchangeRate`, `@/lib/constants`, `@/lib/calculadora/volumetric`, e iconos de `lucide-react`.
- **Usado por**: Páginas de la aplicación que integran calculadoras y análisis de costos (por ejemplo, `src/app/calculadora-volumetrica/page.js`, `src/app/contenedores/[id]/costos/page.js`).

## Detalles clave
- Todos los archivos son componentes de cliente (`'use client'`) debido al uso intensivo de estado local (`useState`), interactividad de formularios y eventos en tiempo real.
- `CostMatrix.js` agrupa los ítems dinámicamente según su categoría y recalcula toda la matriz impositiva y de gastos instantáneamente al modificar el valor FOB o activar/desactivar filas.
- `ExchangeRateSelector.js` contempla el manejo de estados de interfaz (carga, error) delegando la obtención de datos al hook `useExchangeRate`.
- `VolumetricCalc.js` provee retroalimentación visual al usuario indicando si la configuración de cajas actual es válida o si excede el peso máximo soportado por el contenedor seleccionado.