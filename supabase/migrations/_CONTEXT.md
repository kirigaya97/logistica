# 📁 supabase/migrations

## Propósito
Este directorio contiene los scripts SQL de migración que definen el esquema de la base de datos en Supabase, incluyendo tablas, relaciones, políticas de seguridad (RLS) y lógica de servidor mediante triggers y funciones.

## Archivos
| Archivo | Descripción |
|---|---|
| 001_profiles.sql | Gestión de perfiles de usuario vinculados a la autenticación de Supabase y triggers de creación automática. |
| 002_containers.sql | Definición de la entidad principal de contenedores, estados logísticos y seguimiento de fechas (ETA/ETD). |
| 003_exchange_rates.sql | Registro histórico y actual de tipos de cambio (Blue, Oficial, Bolsa, CCL). |
| 004_cost_calculations.sql | Estructura para cálculos de costos por contenedor, permitiendo ítems fijos o porcentuales. |
| 005_packing_lists.sql | Gestión del manifiesto de carga (Packing List) y detalle de ítems individuales con pesos y volúmenes. |
| 006_clients_tags.sql | Definición de clientes, historial de tarifas y sistema de etiquetado para clasificación de carga. |
| 007_cost_template.sql | Configuración de plantillas de costos predeterminadas y almacenamiento de simulaciones. |
| 008_multi_templates.sql | Soporte para múltiples variantes de plantillas (Salida Real, Salida Cliente) y snapshots de resultados. |
| 009_update_container_types_weight.sql | Actualización de tipos de contenedores (40HC/40ST) y restricciones de capacidad de carga en toneladas. |

## Relaciones
- **Usa**: Supabase Auth (para gestión de perfiles) y extensiones nativas de PostgreSQL como `pgcrypto`.
- **Usado por**: `src/lib/supabase/` para la instanciación del cliente y las Server Actions que ejecutan operaciones CRUD sobre estas entidades.

## Detalles clave
- **Seguridad**: Todas las tablas tienen habilitado Row Level Security (RLS) para restringir el acceso solo a usuarios autenticados.
- **Automatización**: Se utilizan Triggers para la actualización automática de campos `updated_at` y la creación de perfiles tras el registro de usuario.
- **Flexibilidad de Costos**: El sistema de cálculo permite definir ítems basados en montos fijos o porcentajes calculados sobre diferentes bases (FOB, CIF, etc.).
- **Integridad**: Existen restricciones (CHECK constraints) estrictas para estados de contenedor, tipos de cambio y capacidades de peso permitidas.
- **Relaciones**: Implementa una arquitectura relacional sólida con borrado en cascada para mantener la integridad entre contenedores, cálculos y listas de empaque.