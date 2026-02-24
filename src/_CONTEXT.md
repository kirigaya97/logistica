# 📂 src

## Propósito
Este directorio es el núcleo del código fuente de la aplicación, encargado de centralizar la lógica de negocio, el enrutamiento, los componentes de la interfaz y las utilidades compartidas del sistema de logística.

## Archivos
| Archivo | Descripción |
|---|---|
| middleware.js | Controla la autenticación y persistencia de sesiones mediante Supabase, gestionando el redireccionamiento de rutas protegidas. |

## Relaciones
- **Usa**: `@supabase/ssr`, `next/server`, Variables de entorno de Supabase.
- **Usado por**: Framework Next.js (ejecución automática a nivel de servidor/edge).

## Detalles clave
- Implementa una barrera de autenticación global que redirige automáticamente a `/login` si no existe una sesión activa.
- Utiliza una estrategia de sincronización de cookies para mantener el estado de autenticación entre el cliente y el servidor.
- La configuración del `matcher` está optimizada para ignorar archivos estáticos, imágenes y rutas de la API, mejorando el rendimiento de las peticiones.
- Actúa como el primer punto de contacto para las solicitudes entrantes, asegurando que el contexto del usuario esté disponible antes de renderizar cualquier página.