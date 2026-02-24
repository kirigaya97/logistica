# 📁 /

## Propósito
Este es el directorio raíz del proyecto Next.js de logística internacional. Contiene los archivos de configuración principales para el framework, el linter y las herramientas de estilos globales que aplican a toda la aplicación.

## Archivos
| Archivo | Descripción |
|---|---|
| `eslint.config.mjs` | Configuración de ESLint para el proyecto, define las reglas recomendadas de Next.js (core-web-vitals) y los directorios a ignorar. |
| `next.config.mjs` | Archivo principal de configuración para el framework Next.js. |
| `postcss.config.mjs` | Configuración de PostCSS, encargado de registrar los plugins de estilos como Tailwind CSS. |

## Relaciones
- **Usa**: `eslint/config`, `eslint-config-next/core-web-vitals`, `@tailwindcss/postcss`
- **Usado por**: Todo el proyecto (las configuraciones aquí definidas aplican globalmente a la aplicación).

## Detalles clave
- Centraliza las configuraciones globales de las herramientas de desarrollo del proyecto.
- Utiliza `@tailwindcss/postcss` como plugin de PostCSS, lo que indica el uso de Tailwind CSS v4+ para el manejo de estilos.
- Define ignorados globales específicos para la construcción de Next.js en el linter (ej. `.next/**`, `out/**`, `build/**`).
- Divide la estructura principal del proyecto en `src/` (código fuente de la aplicación) y `supabase/` (configuraciones o migraciones de base de datos).