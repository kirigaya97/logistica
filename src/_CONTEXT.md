# 📁 src

## Propósito
Directorio principal del código fuente de la aplicación Next.js, encargado de centralizar la estructura de rutas, componentes de interfaz de usuario, hooks personalizados y lógica de negocio para la plataforma de logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| middleware.js | Intercepta las peticiones de Next.js utilizando Supabase para verificar la autenticación del usuario y gestionar las redirecciones entre la página de acceso y las rutas protegidas. |

## Relaciones
- **Usa**: @supabase/ssr, next/server
- **Usado por**: Entorno de ejecución de Next.js

## Detalles clave
- Sincroniza las cookies de sesión de Supabase con la respuesta del servidor para mantener el estado de autenticación.
- Bloquea el acceso a rutas protegidas para usuarios no logueados, redirigiéndolos obligatoriamente a `/login`.
- Evita que usuarios ya autenticados vuelvan a acceder a la pantalla de `/login`, enviándolos a la raíz de la aplicación.
- Optimiza el rendimiento excluyendo del análisis del middleware a los archivos estáticos, imágenes y rutas de API mediante una expresión regular en su configuración.