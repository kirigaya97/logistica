# 📂 src

## Propósito
Punto de entrada principal del código fuente de la aplicación, que centraliza la lógica de negocio, los componentes de la interfaz de usuario, los hooks personalizados y la configuración de seguridad del lado del servidor.

## Archivos
| Archivo | Descripción |
|---|---|
| `middleware.js` | Gestiona la autenticación y protección de rutas mediante Supabase, redirigiendo a los usuarios según su estado de sesión. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/server`, variables de entorno para la configuración de Supabase.
- **Usado por**: Next.js Runtime para el procesamiento de peticiones y control de acceso global.

## Detalles clave
- **Seguridad en el Edge**: El middleware actúa como un guardia de seguridad que intercepta las peticiones antes de que lleguen a las rutas, asegurando que solo usuarios autenticados accedan al panel.
- **Gestión de Cookies**: Implementa una sincronización de cookies entre el cliente de Supabase y `NextResponse` para mantener la persistencia de la sesión en el servidor.
- **Optimización de Rutas**: Utiliza un `matcher` específico para excluir archivos estáticos (imágenes, iconos) y la API de la lógica de redirección, evitando sobrecarga innecesaria.
- **Jerarquía**: Organiza la aplicación siguiendo las convenciones de Next.js (App Router), separando la infraestructura (`lib`, `hooks`) de la vista (`app`, `components`).