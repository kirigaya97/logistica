# 📂 src/components/clientes

## Propósito
Este directorio contiene los componentes de interfaz de usuario dedicados a la gestión de maestros de clientes, permitiendo su creación, edición y la visualización de su actividad logística y evolución de tarifas.

## Archivos
| Archivo | Descripción |
|---|---|
| ClientForm.js | Formulario integral para el alta y edición de clientes, incluyendo la configuración de tarifas internacionales (USD) y locales (ARS). |
| ClientSummary.js | Panel de visualización que consolida estadísticas de carga (volumen, peso, items), lista contenedores asociados y muestra el historial de cambios en tarifas. |

## Relaciones
- **Usa**: `next/link`, `src/components/ui/StatusBadge.js`, `src/lib/constants.js` (WAREHOUSES), `lucide-react`.
- **Usado por**: `src/app/clientes/nuevo/page.js`, `src/app/clientes/[id]/page.js` y otros módulos de gestión de clientes.

## Detalles clave
- **Cálculo de Métricas**: `ClientSummary` realiza una agrupación lógica de los items del cliente para calcular totales de volumen (m³), peso y cantidad de bultos distribuidos por contenedor.
- **Dualidad de Tarifas**: El sistema diferencia y permite el seguimiento histórico de tarifas internacionales (generalmente en USD) y locales (generalmente en ARS).
- **Indicadores de Tendencia**: El historial de tarifas incluye iconos visuales (`TrendingUp`, `TrendingDown`) para identificar rápidamente ajustes en los costos comerciales del cliente.
- **Integración Logística**: Muestra el estado actual de cada contenedor vinculado mediante `StatusBadge`, permitiendo la navegación directa al detalle del contenedor.