# 📁 supabase/migrations

## Propósito
Este directorio contiene los scripts SQL de migración que definen la estructura de la base de datos, las reglas de seguridad de nivel de fila (RLS) y la lógica programable (triggers/funciones) en Supabase.

## Archivos
| Archivo | Descripción |
|---|---|
| 001_profiles.sql | Define la tabla de perfiles que extiende los datos de autenticación, establece políticas de seguridad y automatiza la creación de perfiles mediante triggers. |
| 002_containers.sql | Define la tabla de contenedores con estados, tipos, depósitos de origen, fechas ETD/ETA, tipo de cambio y trigger para `updated_at`. |
| 003_exchange_rates.sql | Tabla de registro histórico de tipos de cambio (blue, oficial, bolsa, CCL) con RLS habilitado. |
| 004_cost_calculations.sql | Tablas `cost_calculations` y `cost_items` para la calculadora de costos de importación con matriz dinámica y overrides de cliente. |

## Relaciones
- **Usa**: Esquema de autenticación nativo de Supabase (`auth.users`).
- **Usado por**: Los clientes de Supabase en el servidor y cliente de la aplicación para gestionar la identidad, permisos, contenedores, costos y tipos de cambio.

## Detalles clave
- **Extensión de Auth**: Utiliza una tabla vinculada a `auth.users` para almacenar metadatos adicionales como el nombre completo y el rol del usuario.
- **Seguridad (RLS)**: Todas las tablas tienen Row Level Security habilitado con políticas de acceso para usuarios autenticados.
- **Automatización**: Incluye funciones y triggers para crear perfiles automáticamente y actualizar timestamps (`updated_at`).
- **Relaciones**: `cost_calculations` referencia `containers`, `cost_items` referencia `cost_calculations` con CASCADE en DELETE.