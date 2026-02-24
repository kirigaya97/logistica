# 🧮 src/components/calculadora

## Propósito
Este módulo contiene los componentes de la interfaz de usuario para realizar cálculos logísticos críticos, incluyendo la simulación de costos de importación, la gestión de plantillas de cálculo y la calculadora de cubicaje (volumétrica).

## Archivos
| Archivo | Descripción |
|---|---|
| `CostMatrix.js` | Componente central para la edición y visualización de la matriz de costos (FOB, CIF, tributos, impuestos y gastos operativos). |
| `ExchangeRateSelector.js` | Interfaz para seleccionar entre distintos tipos de cambio (Oficial, Blue, MEP, CCL) o ingresar un valor manual. |
| `Simulator.js` | Orquestador de simulaciones que permite cargar plantillas, realizar cálculos en tiempo real y gestionar el historial guardado. |
| `TemplateManager.js` | Panel de administración para crear, editar y eliminar plantillas de configuración de la matriz de costos. |
| `VolumetricCalc.js` | Calculadora de cubicaje que determina la cantidad óptima de cajas por contenedor basándose en volumen y peso. |

## Relaciones
- **Usa**: `src/lib/calculadora/engine.js` (lógica de costos), `src/lib/calculadora/volumetric.js` (lógica de cubicaje), `src/lib/calculadora/defaults.js` (configuración inicial), `src/hooks/useExchangeRate.js` (cotizaciones), `src/app/calculadora-costos/actions.js` (persistencia), `src/components/ui/ExportButton.js`.
- **Usado por**: Páginas en `src/app/calculadora-costos/` (Simulador y Configuración) y `src/app/calculadora-volumetrica/`.

## Detalles clave
- **Lógica Centralizada**: Los componentes visuales delegan la lógica matemática pesada a funciones puras en `src/lib/calculadora/` para garantizar consistencia.
- **Interactividad**: Se utilizan componentes de cliente (`'use client'`) para ofrecer feedback inmediato ante cambios en inputs de FOB, dimensiones o porcentajes.
- **Persistencia de Plantillas**: Permite definir estructuras de costos predeterminadas (por ejemplo, para distintos tipos de mercadería) que se guardan en la base de datos.
- **Validación de Cubicaje**: La calculadora volumétrica detecta automáticamente si el peso total excede el máximo permitido del contenedor, marcando la configuración como inválida.
- **Historial**: El simulador permite guardar "snapshots" de los resultados calculados para referencia futura o comparación de escenarios.