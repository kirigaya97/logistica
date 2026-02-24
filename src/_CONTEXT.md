# 📁 src

## Propósito
Directorio principal del código fuente de la aplicación Next.js. Contiene la lógica central de la plataforma de logística internacional, incluyendo el enrutamiento, componentes de la interfaz de usuario, hooks personalizados, utilidades y la configuración de middleware para la gestión de acceso.

## Archivos
| Archivo | Descripción |
|---|---|
| `middleware.js` | Middleware de enrutamiento que gestiona la autenticación de usuarios mediante Supabase. Intercepta las solicitudes, verifica la sesión del usuario a través de cookies y aplica redirecciones protectoras (e.g., hacia `/login` si no está autenticado, o hacia la raíz si ya lo está y busca acceder a `/login`). |

## Relaciones
- **Usa**: `@supabase/ssr` (para la creación del cliente de servidor y manejo de sesiones), `next/server` (para control de respuestas HTTP y redirecciones de enrutamiento).
- **Usado por**: Next.js (el framework ejecuta automáticamente este archivo en las solicitudes entrantes que coinciden con su configuración de rutas).

## Detalles clave
- **Seguridad perimetral**: El `middleware.js` actúa como una barrera de seguridad garantizando que solo los usuarios autenticados puedan acceder a las rutas protegidas de la aplicación.
- **Sincronización de sesión**: Refresca y gestiona automáticamente las cookies de sesión de Supabase durante la evaluación de la solicitud.
- **Optimización de rendimiento**: La configuración del `matcher` excluye explícitamente rutas de activos estáticos (como imágenes y scripts internos de Next) y llamadas a la API para evitar ejecuciones innecesarias del middleware y mejorar los tiempos de respuesta.
- **Arquitectura basada en subdirectorios**: El código está organizado funcionalmente delegando la lógica de vistas a `app/`, elementos reutilizables a `components/`, lógica de estado a `hooks/` y funciones de servicio a `lib/`.