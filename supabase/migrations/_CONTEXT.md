# 📁 supabase/migrations

## Propósito
Este directorio contiene los scripts SQL de migración que definen la estructura de la base de datos, las reglas de seguridad de nivel de fila (RLS) y la lógica programable (triggers/funciones) en Supabase.

## Archivos
| Archivo | Descripción |
|---|---|
| 001_profiles.sql | Define la tabla de perfiles que extiende los datos de autenticación, establece políticas de seguridad y automatiza la creación de perfiles mediante triggers. |

## Relaciones
- **Usa**: Esquema de autenticación nativo de Supabase (`auth.users`).
- **Usado por**: Los clientes de Supabase en el servidor y cliente de la aplicación para gestionar la identidad y permisos de los usuarios.

## Detalles clave
- **Extensión de Auth**: Utiliza una tabla vinculada a `auth.users` para almacenar metadatos adicionales como el nombre completo y el rol del usuario.
- **Seguridad (RLS)**: Implementa políticas estrictas donde los usuarios solo pueden ver y editar su propio perfil basado en su `auth.uid()`.
- **Automatización**: Incluye una función y un trigger (`handle_new_user`) para garantizar que cada nuevo registro en la plataforma genere automáticamente su entrada correspondiente en la tabla de perfiles.
- **Roles**: Define un rol por defecto de 'operator' para los nuevos usuarios, facilitando el control de acceso inicial.