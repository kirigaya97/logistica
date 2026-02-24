# 📁 src/app/historico

## Propósito
Este módulo gestiona la visualización del historial de operaciones, listando exclusivamente los contenedores que han alcanzado el estado "finalizado". Proporciona una vista tabular de registros históricos junto con métricas rápidas de volumen de cierre mensual.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Server Component que consulta, filtra y muestra la lista de contenedores finalizados y estadísticas generales. |

## Relaciones
- **Usa**: `@/lib/supabase/server.js` (acceso a datos), `@/lib/constants.js` (mapeo de depósitos y tipos), `@/components/ui/StatusBadge.js` (etiquetas visuales), `lucide-react` (iconos).
- **Usado por**: Definido en el menú de navegación global (`NAV_GROUPS`) como acceso principal al archivo histórico.

## Detalles clave
- **Lógica de Filtrado**: Realiza una consulta a la tabla `containers` filtrando estrictamente por el valor `status = 'finalizado'`.
- **Ordenamiento**: Los registros se presentan ordenados por fecha de arribo (ETA) de forma descendente.
- **Estadísticas Dinámicas**: Calcula en tiempo real el total de contenedores finalizados y una comparativa del volumen de cierre correspondiente al mes anterior.
- **Integración de Navegación**: Cada fila permite la redirección al detalle completo del contenedor mediante la ruta dinámica `/contenedores/[id]`.
- **Localización**: Implementa formateo de fechas basado en la configuración regional `es-AR`.