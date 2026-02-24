# 🧮 src/lib/calculadora

## Propósito
Este directorio centraliza la lógica de negocio para el cálculo de costos de importación y la optimización de carga volumétrica. Es el núcleo matemático del sistema, encargado de transformar inputs operativos en proyecciones financieras detalladas.

## Archivos
| Archivo | Descripción |
|---|---|
| `defaults.js` | Define la estructura inicial de la matriz de costos, incluyendo categorías (CIF, tributos, impuestos, gastos), valores por defecto y ordenamiento. |
| `engine.js` | Motor de cálculo que procesa la cascada de costos (CIF > Tributos > Base Imponible > Impuestos > Gastos), gestiona overrides para clientes y distribuye costos por volumen. |
| `volumetric.js` | Provee la lógica para calcular la capacidad de carga de contenedores, determinando la cantidad de cajas, el aprovechamiento del volumen y la validez según el peso máximo. |

## Relaciones
- **Usa**: No posee dependencias externas (lógica pura en JavaScript).
- **Usado por**: Componentes de la interfaz en `src/components/calculadora/`, páginas de detalle de contenedores y acciones de servidor para la persistencia de cálculos.

## Detalles clave
- **Lógica de Cascada**: El motor de cálculo en `engine.js` es una función pura que sigue estrictamente el orden legal de importación: el cálculo de tributos depende del CIF, y los impuestos dependen de la suma del CIF más los tributos (Base Imponible).
- **Prorrateo por Volumen**: Incluye una función especializada para distribuir el costo total de un contenedor entre múltiples clientes de forma proporcional a los metros cúbicos ocupados.
- **Flexibilidad de Costos**: Soporta diferentes tipos de base para los cálculos (fijos, porcentajes sobre CIF, porcentajes sobre Base Imponible o sobre gastos específicos como "Costos Agencia").
- **Validación de Carga**: En `volumetric.js`, el sistema no solo calcula el espacio físico, sino que valida si el peso total de las cajas excede la capacidad técnica del contenedor (`isValid`).
- **Transparencia hacia el Cliente**: Permite aplicar "overrides" (nombres y valores alternativos) para generar vistas simplificadas o personalizadas para el cliente final sin alterar la lógica de costos real.