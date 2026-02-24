# 📂 src/app/login

## Propósito
Este directorio contiene la interfaz y la lógica de autenticación de la aplicación. Proporciona la página de inicio de sesión para que los usuarios accedan a la plataforma de logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de cliente que renderiza el formulario de inicio de sesión y gestiona la autenticación de usuarios contra Supabase. |

## Relaciones
- **Usa**: `@/lib/supabase/client` (para el cliente de base de datos y autenticación), `next/navigation` (para redirección de rutas), `lucide-react` (para iconos).
- **Usado por**: El sistema de enrutamiento de Next.js (ruta pública accesible por usuarios no autenticados).

## Detalles clave
- Componente de cliente (`'use client'`) que maneja estados locales para email, contraseña, carga y errores.
- La autenticación se realiza mediante el método `signInWithPassword` de Supabase Auth.
- Tras un inicio de sesión exitoso, redirige a la raíz (`/`) y fuerza un refresco del enrutador (`router.refresh()`) para actualizar el estado de la sesión en toda la app.
- El diseño utiliza clases de utilidad de Tailwind CSS con una paleta de colores en tonos oscuros (gray-900, gray-800).
- Contiene manejo de errores básico, mostrando un mensaje en pantalla si las credenciales son incorrectas.