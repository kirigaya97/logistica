# 🧮 src/components/calculadora

## Propósito
Este módulo centraliza los componentes de interfaz de usuario para el cálculo de costos de importación y el análisis de cubicaje (volumetría) de contenedores, permitiendo realizar simulaciones financieras y logísticas precisas.

## Archivos
| Archivo | Descripción |
|---|---|
| CostMatrix.js | Matriz interactiva que desglosa y calcula costos (CIF, impuestos, gastos) basándose en un valor FOB. |
| ExchangeRateSelector.js | Selector de tipos de cambio (Blue, Oficial, MEP, CCL) con datos en tiempo real y soporte para override manual. |
| Simulator.js | Componente principal del simulador que gestiona el historial de cálculos, plantillas y persistencia de simulaciones. |
| TemplateManager.js | Interfaz para la creación y edición de plantillas de costos predefinidas (ej: configuración por defecto vs alternativas). |
| VolumetricCalc.js | Herramienta de cálculo de cubicaje que determina la cantidad máxima de bultos por peso y volumen según el tipo de contenedor. |

## Relaciones
- **Usa**: 
    - `@/lib/calculadora/engine`: Para la lógica de cálculo de la matriz de costos.
    - `@/lib/calculadora/defaults`: Para las categorías y estructuras iniciales de costos.
    - `@/lib/calculadora/volumetric`: Para el motor de cálculo de estiba y pesos.
    - `@/app/calculadora-costos/actions`: Para operaciones de persistencia en base de datos.
    - `@/hooks/useExchangeRate`: Para la obtención de cotizaciones de divisas.
    - `@/components/ui/ExportButton`: Para la generación de reportes en Excel.
- **Usado por**: 
    - `src/app/calculadora-costos/page.js` (Simulador principal)
    - `src/app/calculadora-costos/config/page.js` (Configuración de plantillas)
    - `src/app/calculadora-volumetrica/page.js` (Herramienta de cubicaje)

## Detalles clave
- **Separación de Lógica**: Los componentes de UI delegan la complejidad matemática a funciones puras en `@/lib/calculadora/`, asegurando consistencia entre la vista y los reportes exportados.
- **Persistencia de Simulaciones**: `Simulator.js` permite guardar "snapshots" de los resultados, capturando no solo los inputs sino también el estado calculado de cada ítem en ese momento.
- **Gestión de Plantillas**: El sistema soporta una plantilla "default" global y plantillas personalizadas (slug-based) que pueden intercambiarse dinámicamente.
- **Validación Logística**: El calculador volumétrico no solo considera el espacio físico sino que valida el peso máximo permitido por el tipo de contenedor, alertando sobre excesos.
- **Interactividad**: Se utiliza `lucide-react` para toda la iconografía y `next/navigation` para el manejo de estados mediante parámetros de URL (ej: `?template=slug`).