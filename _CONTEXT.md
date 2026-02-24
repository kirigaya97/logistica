# 📁 Raíz del Proyecto

## Propósito
Directorio principal de configuración de un proyecto de logística internacional construido con Next.js. Contiene la configuración esencial de herramientas de calidad de código, de compilación y de procesamiento de estilos.

## Archivos
| Archivo | Descripción |
|---|---|
| `eslint.config.mjs` | Configuración plana de ESLint con reglas recomendadas de Next.js (Core Web Vitals) y directorios de salida a ignorar. |
| `next.config.mjs` | Archivo de configuración principal del framework Next.js. |
| `postcss.config.mjs` | Configuración de PostCSS encargada de integrar el plugin de Tailwind CSS. |

## Relaciones
- **Usa**: `eslint/config`, `eslint-config-next/core-web-vitals`, `@tailwindcss/postcss`.
- **Usado por**: Entorno de desarrollo local, proceso de compilación del framework (build) y herramientas de análisis estático.

## Detalles clave
- Utiliza el nuevo formato de configuración plana (Flat Config) para ESLint en lugar de los archivos `.eslintrc` tradicionales.
- Excluye explícitamente directorios de compilación y tipos (`.next/**`, `out/**`, `build/**`, `next-env.d.ts`) de la validación de código.
- Configura Tailwind CSS directamente como un plugin de PostCSS para el manejo de estilos.
- El código fuente de la aplicación principal reside en el subdirectorio `src/`.
- La configuración relacionada con la base de datos se maneja en el subdirectorio `supabase/`.