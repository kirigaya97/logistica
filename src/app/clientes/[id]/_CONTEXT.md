# 📂 src/app/clientes/[id]

## Propósito
Gestiona la visualización detallada, edición y eliminación de un cliente específico, integrando su historial de tarifas y estadísticas consolidadas de contenedores y carga.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Componente de servidor que renderiza la vista de detalles o el formulario de edición basado en el parámetro de búsqueda `edit`. |

## Relaciones
- **Usa**: `@/lib/supabase/server`, `@/app/clientes/actions`, `@/components/clientes/ClientForm`, `@/components/clientes/ClientSummary`, `next/navigation`.
- **Usado por**: Router de Next.js para la ruta dinámica `/clientes/[id]`.

## Detalles clave
- **Modo Edición**: Utiliza el searchParam `?edit=true` para alternar entre la visualización de datos (`ClientSummary`) y el formulario de actualización (`ClientForm`).
- **Acciones Vinculadas**: Emplea `.bind(null, id)` para pasar el ID del cliente a las Server Actions de actualización y eliminación de forma segura.
- **Agregación de Datos**: La función `getClientWithHistory` consolida información de múltiples tablas: datos base del cliente, historial de cambios en tarifas y estadísticas calculadas (volumen total, peso y etiquetas únicas) de los items en listas de empaque.
- **Historial de Tarifas**: El sistema detecta cambios en las tarifas internacionales (USD) o locales (ARS) durante la actualización y registra automáticamente el valor anterior y nuevo en la tabla `client_rate_history`.
- **Navegación**: Incluye validación de existencia mediante `notFound()` si el cliente no es recuperado de la base de datos.