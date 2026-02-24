# 📁 src/app/calculadora-costos/config

## Propósito
Este directorio contiene la página de configuración para la plantilla de costos por defecto de la calculadora. Permite a los usuarios ajustar los valores porcentuales o fijos base que se aplicarán automáticamente a los nuevos contenedores.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Página de servidor (Server Component) que carga la plantilla actual, advierte sobre el impacto de los cambios y renderiza la matriz de costos para su edición interactiva. |

## Relaciones
- **Usa**: `../actions` (`getDefaultTemplate`, `saveDefaultTemplate`), `@/lib/calculadora/defaults` (`DEFAULT_COST_MATRIX`), `@/components/calculadora/CostMatrix`, `lucide-react` (iconos), `next/link`.
- **Usado por**: Interfaz principal de la aplicación (navegable desde el simulador de calculadora de costos).

## Detalles clave
- **Persistencia mediante Server Actions**: Utiliza una Server Action en línea (`handleSave`) para guardar la estructura y los valores editados de la plantilla directamente en el servidor.
- **Renderizado de Vista Previa**: Inyecta un objeto `mockCalculation` con un valor FOB fijo de 1000 y asignaciones temporales de IDs y propiedades (`value_type`, `is_active`) para permitir que el componente genérico `CostMatrix` funcione como un editor de plantillas.
- **Regla de Negocio de Inmutabilidad Histórica**: Existe una regla crítica de negocio comunicada explícitamente en la UI: los cambios en la plantilla solo aplican a nuevos contenedores, sin afectar a simulaciones guardadas ni contenedores preexistentes.
- **Reutilización Estratégica**: Emplea el mismo componente visual `CostMatrix` utilizado en la simulación activa de costos, pasándole funciones de callback adaptadas (`onSave`) para un propósito de configuración en lugar de simulación pura.