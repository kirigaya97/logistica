# 🧮 src/app/calculadora-costos

## Propósito
Este módulo proporciona una herramienta de simulación de costos de importación independiente de los contenedores operativos. Permite proyectar gastos, tributos e impuestos basados en plantillas configurables y guardar dichas simulaciones para análisis histórico y toma de decisiones.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Define las Server Actions para el manejo de persistencia en Supabase, incluyendo el CRUD de simulaciones y la gestión de plantillas de costos. |
| `page.js` | Punto de entrada principal que recupera en paralelo las simulaciones, plantillas e ítems de configuración para inicializar el componente Simulator. |

## Subdirectorios
- `config/`: Interfaz para la personalización y creación de plantillas de costos (items, porcentajes y tipos de cálculo).
- `[id]/`: Vista de detalle para consultar una simulación guardada específica mediante su identificador.

## Relaciones
- **Usa**: `@/lib/supabase/server`, `@/components/calculadora/Simulator`, `@/lib/calculadora/defaults`, `lucide-react`, `next/cache`.
- **Usado por**: Menú de navegación principal (Sidebar) como herramienta central de análisis de costos.

## Detalles clave
- **Snapshots de Datos**: Al guardar una simulación, se almacena un "snapshot" (captura) del resultado calculado para preservar la integridad de los datos históricos frente a cambios futuros en las plantillas.
- **Configuración por Plantillas**: Utiliza un sistema de `slugs` para alternar entre diferentes estructuras de costos (ej. "default", "especial"), permitiendo simular bajo distintos regímenes impositivos o logísticos.
- **Carga Eficiente**: Implementa `Promise.all` en el Server Component para minimizar la latencia al obtener datos de simulaciones y configuraciones de forma simultánea.
- **Cálculos Desvinculados**: Diseñado para funcionar sin necesidad de un contenedor o packing list real, utilizando valores FOB manuales para las proyecciones.
- **Sincronización de Cache**: Utiliza `revalidatePath` para garantizar que los cambios en las plantillas se reflejen inmediatamente tanto en el simulador como en el módulo de contenedores.