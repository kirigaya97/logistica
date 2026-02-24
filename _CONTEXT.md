# 🌍 Directorio Raíz

## Propósito
Este directorio raíz actúa como el núcleo de configuración de la plataforma de logística internacional basada en Next.js. Centraliza las reglas de calidad de código, la configuración base del framework y el motor de procesamiento de estilos de la aplicación.

## Archivos
| Archivo | Descripción |
|---|---|
| `eslint.config.mjs` | Configuración plana de ESLint optimizada para Next.js (Core Web Vitals), definiendo reglas de calidad y exclusiones de rutas de compilación. |
| `next.config.mjs` | Archivo principal de configuración del framework Next.js, utilizado para ajustar opciones de compilación y comportamiento general. |
| `postcss.config.mjs` | Configuración del procesador PostCSS que habilita e integra Tailwind CSS para la generación de estilos del proyecto. |

## Relaciones
- **Usa**: Framework Next.js, ESLint (`eslint/config`, `eslint-config-next`), Tailwind CSS y PostCSS.
- **Usado por**: Entorno de desarrollo local, herramientas de compilación de Node.js, pipelines de CI/CD y el código fuente contenido en el subdirectorio `src/`.

## Detalles clave
- La configuración de ESLint emplea el formato plano (`eslint.config.mjs`) y define ignorados globales explícitos para omitir carpetas autogeneradas (`.next`, `out`, `build`).
- El sistema de diseño se basa en Tailwind CSS, inyectado directamente a través de la configuración de PostCSS.
- Toda la lógica de negocio, rutas y componentes de la interfaz de usuario se delegan al subdirectorio `src/`, manteniendo la raíz exclusiva para la orquestación del entorno.