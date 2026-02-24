# 📂 supabase/migrations

## Propósito
Este directorio contiene la evolución del esquema de la base de datos en Supabase, definiendo la estructura de tablas, relaciones, políticas de seguridad (RLS), funciones y triggers necesarios para la operación del sistema de logística.

## Archivos
| Archivo | Descripción |
|---|---|
| 001_profiles.sql | Define la tabla de perfiles de usuario extendiendo auth.users y automatiza su creación mediante triggers. |
| 002_containers.sql | Estructura principal para la gestión de contenedores, estados logísticos y metadatos de transporte. |
| 003_exchange_rates.sql | Registro histórico de diversos tipos de cambio (oficial, blue, bolsa, CCL). |
| 004_cost_calculations.sql | Define el motor de persistencia para cálculos de costos e ítems individuales con lógica de overrides. |
| 005_packing_lists.sql | Gestiona la relación entre contenedores y sus listas de empaque, incluyendo el detalle de bultos. |
| 006_clients_tags.sql | Administración de clientes, historial de tarifas personalizadas y sistema de etiquetas para ítems. |
| 007_cost_template.sql | Implementa plantillas configurables de costos y simulaciones basadas en objetos JSONB. |
| 008_multi_templates.sql | Expande el sistema de plantillas para soportar múltiples versiones (Base, Real, Cliente) y snapshots. |

## Relaciones
- **Usa**: Supabase Auth (para la vinculación de perfiles de usuario).
- **Usado por**: `src/lib/supabase/` para la interacción con datos y Server Actions en los módulos de contenedores, clientes y calculadora.

## Detalles clave
- **Seguridad RLS**: Todas las tablas implementan Row Level Security (RLS) con políticas de acceso para usuarios autenticados.
- **Automatización**: Se utilizan triggers de PostgreSQL para mantener actualizados los campos `updated_at` y sincronizar perfiles de usuario.
- **Flexibilidad**: La configuración de costos utiliza `JSONB` en las plantillas para permitir cambios en la estructura de cálculo sin migraciones de esquema frecuentes.
- **Integridad**: Relaciones con `ON DELETE CASCADE` en entidades dependientes (como ítems de packing list o cálculos de costo) para garantizar la limpieza de datos.
- **Historial**: Tablas específicas para el seguimiento de cambios en tarifas de clientes y tipos de cambio de divisas.