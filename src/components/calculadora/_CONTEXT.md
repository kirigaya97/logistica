# 🧮 src/components/calculadora

## Propósito
Este módulo centraliza los componentes de interfaz para el motor de cálculos del sistema, permitiendo realizar simulaciones de costos de importación, gestionar plantillas de configuración y calcular el cubicaje volumétrico de contenedores.

## Archivos
| Archivo | Descripción |
|---|---|
| `CostMatrix.js` | Componente núcleo que visualiza y permite editar la matriz de costos (CIF, tributos, impuestos, gastos) de forma reactiva. |
| `ExchangeRateSelector.js` | Selector de cotizaciones de divisas (Blue, Oficial, MEP, CCL) con soporte para sobrescritura manual del valor. |
| `Simulator.js` | Interfaz principal de simulación que integra la matriz de costos con la persistencia de resultados y el historial de cálculos. |
| `TemplateManager.js` | Gestor de configuraciones predefinidas que permite crear y modificar las bases de cálculo para distintos tipos de operación. |
| `VolumetricCalc.js` | Herramienta de cálculo de cubicaje que determina la capacidad máxima de cajas por volumen y peso según el tipo de contenedor. |

## Relaciones
- **Usa**: `@/lib/calculadora` (engine, volumetric, defaults), `@/hooks/useExchangeRate`, `@/app/calculadora-costos/actions`, `@/components/ui/ExportButton`, `@/lib/constants`.
- **Usado por**: Páginas de la ruta `/calculadora-costos` (simulador y configuración) y `/calculadora-volumetrica`.

## Detalles clave
- **Cálculos Reactivos**: Tanto la matriz de costos como el cubicaje se recalculan en tiempo real ante cualquier cambio en los inputs utilizando funciones puras del `lib/calculadora`.
- **Persistencia**: Las simulaciones y plantillas se guardan en Supabase mediante Server Actions, incluyendo un "snapshot" de los resultados calculados para auditoría histórica.
- **Categorización**: Los ítems de costo están agrupados jerárquicamente (CIF -> Tributos -> Base Imponible -> Impuestos -> Gastos) siguiendo la lógica aduanera argentina.
- **Validación de Restricciones**: El calculador volumétrico identifica automáticamente si el limitante de carga es el volumen físico o el peso máximo permitido (TN).
- **Modos de Operación**: `CostMatrix` soporta un modo `readOnly` para visualización de registros históricos sin permitir la edición de la estructura de costos.