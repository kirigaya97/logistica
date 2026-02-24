# 📁 src/app/clientes

## Propósito
Módulo encargado de la gestión integral de los clientes del sistema de logística. Permite visualizar el directorio de clientes, administrar su información básica, y controlar sus tarifas aplicables (locales e internacionales), además de recopilar estadísticas de sus operaciones.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Server Actions que manejan el CRUD de clientes. Realiza validaciones, actualiza el historial de tarifas y calcula estadísticas cruzando datos con operaciones y contenedores. |
| `page.js` | Componente de servidor (Server Component) que muestra el listado completo de clientes mediante una interfaz de tarjetas con su información principal y accesos a sus detalles. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (Base de datos), `next/cache` (Revalidación de caché), `next/navigation` (Redirección), `zod` (Validación de esquemas) y `lucide-react` (Iconografía). También se relaciona de forma anidada con los subdirectorios `nuevo/` y `[id]/`.
- **Usado por**: Por determinar (típicamente accedido desde la barra de navegación principal de la aplicación; sus datos son referenciados por los ítems del packing list).

## Detalles clave
- **Historial de Tarifas Automático**: Al actualizar un cliente en `actions.js`, el sistema detecta automáticamente si hubo cambios en la tarifa internacional o local y registra los valores anteriores y nuevos en la tabla `client_rate_history`.
- **Cálculo de Estadísticas Agregadas**: La función de obtención de datos detallados extrae y acumula información de los `packing_list_items` asociados al cliente, calculando métricas en tiempo real como volumen total (m3), peso total (kg), y cantidad de contenedores únicos involucrados.
- **Validación Estricta**: Emplea `zod` en las acciones del servidor para asegurar que los datos enviados desde los formularios (nombre, locación, tarifas) tengan el formato correcto antes de interactuar con Supabase.
- **Mutaciones Seguras**: Utiliza Server Actions nativos de Next.js junto con `revalidatePath` para asegurar que la interfaz de usuario siempre refleje el estado más reciente de la base de datos tras crear, editar o eliminar un cliente.