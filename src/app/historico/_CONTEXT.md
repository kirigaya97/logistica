# 📂 src/app/historico

## Propósito
Este directorio gestiona la vista del historial de operaciones logísticas. Su propósito principal es presentar un panel de lectura y un listado de todos los contenedores cuyo estado es estrictamente "finalizado", permitiendo la auditoría y consulta de registros pasados.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Componente de servidor que consulta los contenedores finalizados, calcula estadísticas temporales (total general y mes pasado) y renderiza una tabla resumen con enlaces al detalle. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (conexión a base de datos), `@/lib/constants` (diccionarios de almacenes y tipos de contenedores), `@/components/ui/StatusBadge` (interfaz), `lucide-react` (iconografía) y `next/link` (navegación interna).
- **Usado por**: Next.js App Router (expone la ruta de acceso público/autenticado `/historico` en la aplicación).

## Detalles clave
- La consulta de datos aplica un filtro fuerte en el servidor (`eq('status', 'finalizado')`), asegurando que solo se exponga la carga histórica.
- Las estadísticas de "Finalizados Mes Pasado" se calculan dinámicamente en memoria evaluando la fecha de arribo (ETA) contra el mes y año actuales.
- Es un React Server Component, por lo que la obtención de datos de Supabase y la resolución de constantes (origen, tipo de contenedor) ocurren del lado del servidor.
- La tabla de resultados actúa como punto de entrada hacia la información detallada y de solo lectura de cada contenedor mediante la ruta `/contenedores/[id]`.