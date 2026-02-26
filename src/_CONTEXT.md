# 📦 src

## Propósito
Contiene el código fuente principal de la aplicación, centralizando la lógica de ruteo, componentes de interfaz, hooks personalizados y utilidades de integración con servicios externos.

## Archivos
| Archivo | Descripción |
|---|---|
| `middleware.js` | Gestiona la autenticación y protección de rutas mediante Supabase, controlando el flujo de acceso entre la aplicación y la página de login. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/server`.
- **Usado por**: Next.js (ejecución nativa a nivel de ruteo para interceptar solicitudes).

## Detalles clave
- **Guardia de Seguridad**: Implementa una lógica de redirección automática que asegura que solo usuarios autenticados accedan a la aplicación, exceptuando la ruta de `/login`.
- **Sincronización de Sesión**: Utiliza `createServerClient` para manejar y sincronizar cookies de autenticación entre el servidor y el cliente de forma transparente.
- **Configuración de Matcher**: Está optimizado para ignorar archivos estáticos (`_next`, imágenes, favicons) y rutas de API, evitando ejecuciones innecesarias del middleware.