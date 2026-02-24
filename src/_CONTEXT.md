# 📂 src

## Propósito
Directorio raíz del código fuente de la aplicación que centraliza la lógica de negocio, la interfaz de usuario y las configuraciones de flujo de trabajo para el sistema de gestión logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| `middleware.js` | Gestiona la autenticación global y la protección de rutas, redirigiendo usuarios según su estado de sesión mediante Supabase SSR. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/server`
- **Usado por**: Next.js (ejecución a nivel de servidor)

## Detalles clave
- **Autenticación**: El middleware actúa como guardia de seguridad, asegurando que solo usuarios autenticados accedan a las rutas operativas (excepto `/login` y archivos estáticos).
- **Gestión de Sesión**: Implementa una lógica de sincronización de cookies para mantener el estado de Supabase entre el servidor y el cliente.
- **Estructura Modular**: Organiza el proyecto siguiendo las convenciones de Next.js App Router, separando componentes, hooks y utilitarios en subdirectorios especializados.
- **Exclusiones**: El matcher del middleware está configurado para ignorar assets estáticos (imágenes, favicons) y rutas de API para optimizar el rendimiento.