# 📁 src/app/clientes

## Propósito
Gestiona la sección de clientes de la aplicación, proporcionando la interfaz de usuario para listar los clientes actuales y la lógica del servidor necesaria para realizar operaciones de creación, lectura, actualización y eliminación (CRUD).

## Archivos
| Archivo | Descripción |
|---|---|
| actions.js | Acciones de servidor (Server Actions) para gestionar clientes, validar datos y mantener un registro automático del historial de cambios en las tarifas locales e internacionales. |
| page.js | Componente de servidor que renderiza la vista principal de la ruta, mostrando una grilla de tarjetas con la información resumida de cada cliente y un acceso directo para registrar uno nuevo. |

## Relaciones
- **Usa**: Cliente de base de datos Supabase (@/lib/supabase/server), utilidades de Next.js (next/navigation, next/cache, next/link), librería de validación Zod y biblioteca de iconos Lucide React.
- **Usado por**: El enrutador de la aplicación Next.js (como la ruta principal /clientes) y los subdirectorios internos `nuevo/` y `[id]/` que consumen sus acciones.

## Detalles clave
- **Trazabilidad de tarifas**: La acción de actualización compara los valores nuevos con los existentes y, si detecta modificaciones en la tarifa internacional o local, inserta automáticamente un registro en la tabla de historial de tarifas.
- **Validación de datos**: Todas las mutaciones de datos de clientes están protegidas por un esquema de validación estricto definido con Zod, asegurando la integridad de los datos antes de interactuar con Supabase.
- **Consultas compuestas**: La función de obtención de cliente individual está optimizada para traer no solo los datos del cliente, sino también su historial de tarifas y todos los ítems de listas de empaque vinculados a contenedores que le pertenecen en una sola operación.
- **Experiencia de usuario**: La página principal incluye manejo de errores en la consulta de datos y un estado vacío (empty state) visualmente amigable cuando el sistema aún no tiene clientes registrados.