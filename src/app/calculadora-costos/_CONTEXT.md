# 🧮 src/app/calculadora-costos

## Propósito
Este módulo gestiona el simulador de costos de importación, permitiendo realizar cálculos detallados basados en plantillas configurables sin necesidad de vincularlos a un contenedor específico. Facilita la proyección de gastos y el guardado de escenarios para referencia futura.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Server Actions para el CRUD de simulaciones y la gestión de plantillas de costos (templates) en Supabase. |
| `page.js` | Punto de entrada principal que carga en paralelo simulaciones, plantillas y la configuración activa para el simulador. |

## Relaciones
- **Usa**: 
    - `@/lib/supabase/server` para persistencia de datos.
    - `@/components/calculadora/Simulator` como interfaz principal de usuario.
    - `@/lib/calculadora/defaults` para obtener la matriz de costos por defecto.
    - `lucide-react` para la iconografía de la interfaz.
- **Usado por**: Menú de navegación principal (Sidebar) como herramienta independiente de gestión.

## Detalles clave
- **Sistema de Plantillas**: Permite definir diferentes perfiles de costos (ej: General, Electrónica, etc.) mediante `cost_template_config`, facilitando la reutilización de estructuras de gastos.
- **Snapshots de Resultados**: Al guardar una simulación, se almacena un "snapshot" completo de los resultados calculados. Esto garantiza que el historial sea inmutable aunque las fórmulas o valores de la plantilla cambien en el futuro.
- **Carga Eficiente**: Utiliza `Promise.all` en el Server Component (`page.js`) para obtener simultáneamente el historial de simulaciones y las configuraciones de plantillas, optimizando el tiempo de respuesta.
- **Validación de Datos**: Las simulaciones incluyen el tipo y valor de la tasa de cambio utilizada al momento del guardado para mayor precisión histórica.
- **Revalidación de Caché**: Emplea `revalidatePath` para asegurar que los cambios en las plantillas o el borrado de simulaciones se reflejen inmediatamente en la interfaz.