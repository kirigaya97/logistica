# 📁 src/lib/supabase

## Propósito
Proporcionar la configuración y la inicialización de los clientes de Supabase para la aplicación Next.js, permitiendo la interacción con la base de datos y la autenticación tanto desde el entorno del cliente (navegador) como desde el servidor.

## Archivos
| Archivo | Descripción |
|---|---|
| `client.js` | Inicializa y exporta el cliente de Supabase optimizado para ser utilizado en el navegador (Browser Client). |
| `server.js` | Inicializa y exporta el cliente de Supabase para entornos de servidor (Server Components, Server Actions o Route Handlers), gestionando adecuadamente la lectura y escritura de cookies de sesión. |

## Relaciones
- **Usa**: `@supabase/ssr` para la creación de los clientes, `next/headers` para la gestión de cookies en el servidor, y variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Usado por**: Componentes de cliente, Server Components, Server Actions, middleware y manejadores de rutas (API) en toda la aplicación que requieran interactuar con la base de datos.

## Detalles clave
- Utiliza el paquete oficial `@supabase/ssr` asegurando compatibilidad nativa con el App Router de Next.js.
- El cliente de servidor (`server.js`) implementa un bloque `try/catch` al intentar establecer cookies (`setAll`) para evitar que la aplicación falle al renderizar Server Components, donde las cookies son de solo lectura.
- Mantiene una separación clara de responsabilidades entre el cliente web y el servidor para garantizar la seguridad del estado de la sesión y las consultas a la base de datos.
- Depende exclusivamente de variables de entorno públicas para establecer la conexión inicial con el proyecto de Supabase.