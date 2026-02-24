Voy a leer el archivo `_CONTEXT.md` actual en `supabase/migrations/` para verificar si existen secciones manuales que deba preservar, y luego generaré la nueva versión solicitada.

# 📂 supabase/migrations

## Propósito
Contiene los scripts SQL de migración de la base de datos de Supabase que definen el esquema relacional, las políticas de seguridad de nivel de fila (RLS), triggers automáticos e índices para el sistema de gestión de logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| 001_profiles.sql | Define la tabla de perfiles de usuario vinculada a auth.users, incluyendo políticas RLS y trigger de auto-creación. |
| 002_containers.sql | Crea la tabla de contenedores con sus atributos (origen, tipo, estado), validaciones de dominio y trigger para actualización de fechas. |
| 003_exchange_rates.sql | Establece el registro histórico de tipos de cambio (blue, oficial, bolsa, CCL) para conversiones monetarias precisas. |
| 004_cost_calculations.sql | Estructura las tablas de liquidación de costos y sus ítems individuales, soportando cálculos fijos, porcentuales y ajustes por cliente. |
| 005_packing_lists.sql | Define la relación entre contenedores y sus packing lists, incluyendo el desglose de ítems, pesos y dimensiones volumétricas. |
| 006_clients_tags.sql | Implementa la gestión de clientes (tarifas y etiquetas), el historial de cambios en sus tasas y la clasificación mediante etiquetas (many-to-many). |

## Relaciones
- **Usa**: Esquema nativo de Supabase Auth (auth.users), funciones PL/pgSQL y tipos de datos de PostgreSQL.
- **Usado por**: Plataforma Supabase para la evolución del esquema y el cliente de Supabase en Next.js para operaciones CRUD en la aplicación.

## Detalles clave
- **Seguridad RLS:** Implementación de Row Level Security en todas las tablas, restringiendo el acceso únicamente a usuarios autenticados para operaciones generales y validando propiedad en perfiles.
- **Integridad y Validaciones:** Uso de restricciones CHECK para asegurar estados válidos en contenedores (deposito, transito, etc.), tipos de cambio y orígenes de almacén.
- **Automatización mediante Triggers:** Empleo de funciones PL/pgSQL para sincronizar perfiles de usuario tras el registro y mantener actualizados los campos de auditoría temporal (updated_at).
- **Manejo de Costos y Tarifas:** Diseño flexible que permite separar el FOB total de los ítems de costo individuales, permitiendo márgenes de ganancia personalizables y trazabilidad de cambios en tarifas de clientes.
- **Optimización de Consultas:** Inclusión de índices estratégicos en relaciones frecuentes como ítems de packing list, etiquetas de ítems e historial de tarifas para garantizar el rendimiento.