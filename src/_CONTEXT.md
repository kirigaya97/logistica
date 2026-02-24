# 📁 src

## Propósito
Directorio principal del código fuente de la aplicación Next.js de logística internacional. Contiene la lógica de enrutamiento, componentes de interfaz gráfica, configuración de middleware y utilidades.

## Archivos
| Archivo | Descripción |
|---|---|
| middleware.js | Gestiona la autenticación de usuarios mediante Supabase y protege las rutas redirigiendo según el estado de la sesión. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/server`
- **Usado por**: Framework Next.js (ejecutado automáticamente en cada solicitud web)

## Detalles clave
- Implementa protección de rutas validando la sesión activa con Supabase.
- Redirige automáticamente a los usuarios no autenticados a la página de `/login`.
- Evita que los usuarios con sesión iniciada accedan nuevamente a `/login`, enviándolos a `/`.
- Utiliza y actualiza las cookies necesarias para mantener la sesión de autenticación persistente.
- El `matcher` excluye archivos estáticos, imágenes y rutas internas (`_next`) de la ejecución del middleware para optimizar el rendimiento.