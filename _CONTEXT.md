# 📁 Raíz del Proyecto (/)

## Propósito
Este directorio actúa como la base de la aplicación Next.js para logística internacional. Contiene los archivos de configuración global esenciales para el entorno de desarrollo, la construcción del proyecto, el formateo de código y los estilos.

## Archivos
| Archivo | Descripción |
|---|---|
| `eslint.config.mjs` | Configuración global de ESLint que implementa las reglas recomendadas de Next.js (`core-web-vitals`) y define las carpetas ignoradas para el análisis estático. |
| `next.config.mjs` | Archivo principal de configuración para el framework Next.js donde se definen opciones de compilación y comportamiento del servidor. |
| `postcss.config.mjs` | Configuración de PostCSS, encargada de procesar los estilos e integrar los plugins necesarios, en este caso Tailwind CSS. |

## Relaciones
- **Usa**: Framework Next.js (`next`), herramientas de linting (`eslint/config`, `eslint-config-next`), y plugins de estilos (`@tailwindcss/postcss`).
- **Usado por**: Herramientas de compilación, empaquetado y el servidor de desarrollo en todo el ciclo de vida del proyecto.

## Detalles clave
- Sirve como punto de entrada de la configuración para toda la infraestructura frontend del proyecto de logística.
- Establece Tailwind CSS como el motor principal para el manejo de estilos en la aplicación.
- Separa claramente la arquitectura manteniendo el código fuente en `src/` y las configuraciones de base de datos en `supabase/`.
- Prioriza las mejores prácticas de rendimiento en Next.js al aplicar las reglas de linting `core-web-vitals`.