# 🧮 src/components/calculadora

## Propósito
Este módulo contiene los componentes de interfaz de usuario necesarios para realizar cálculos logísticos críticos, incluyendo la simulación de costos de importación y el cálculo de cubicaje (optimización de carga) para contenedores.

## Archivos
| Archivo | Descripción |
|---|---|
| `CostMatrix.js` | Grilla interactiva para la edición y visualización de la estructura de costos (FOB, CIF, tributos, impuestos y gastos). |
| `ExchangeRateSelector.js` | Componente de selección de divisas que permite utilizar cotizaciones en tiempo real o valores personalizados para proyecciones en ARS. |
| `Simulator.js` | Orquestador de simulaciones que permite nombrar, guardar, listar y exportar diferentes escenarios de costos de importación. |
| `TemplateManager.js` | Interfaz para la administración de plantillas de costos, permitiendo definir configuraciones base o alternativas para la calculadora. |
| `VolumetricCalc.js` | Herramienta de cálculo de cubicaje que determina la capacidad máxima de bultos en un contenedor basándose en volumen y peso. |

## Relaciones
- **Usa**: `lib/calculadora/engine` (motor de cálculo), `lib/calculadora/volumetric` (lógica de cubicaje), `lib/calculadora/defaults` (estructuras base), `hooks/useExchangeRate` (datos de divisas), `app/calculadora-costos/actions` (persistencia) y `components/ui/ExportButton`.
- **Usado por**: Las páginas principales de `/calculadora-costos`, `/calculadora-volumetrica` y las vistas de gestión de costos dentro de los detalles de contenedores.

## Detalles clave
- **Lógica Descentralizada**: Los componentes actúan como controladores de vista, delegando los cálculos matemáticos pesados a funciones puras en `lib/calculadora`.
- **Persistencia**: Utiliza *Server Actions* para guardar simulaciones y configuraciones de plantillas directamente en Supabase.
- **Doble Restricción en Cubicaje**: El calculador volumétrico no solo considera las dimensiones físicas (largo, ancho, alto) sino también la capacidad de carga en toneladas del contenedor.
- **Interactividad**: Los componentes manejan estados de "sucio" (`isDirty`) y carga (`saving`) para mejorar la experiencia de usuario durante la edición de matrices complejas.
- **Proyecciones en ARS**: La integración con el selector de tasa de cambio permite visualizar el "Costo Total Proyectado" en moneda local de forma dinámica.