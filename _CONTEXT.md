# 📂 Raíz del Proyecto

## Propósito
Punto de entrada principal y centro de configuración global de la plataforma de gestión logística internacional, encargada de orquestar el framework Next.js, la infraestructura de base de datos con Supabase y las herramientas de automatización.

## Archivos
| Archivo | Descripción |
|---|---|
| `next.config.mjs` | Configuración central del framework Next.js para el entorno de ejecución y compilación. |
| `eslint.config.mjs` | Definición de reglas de calidad de código y estándares de desarrollo para React y Next.js. |
| `postcss.config.mjs` | Configuración del procesador de estilos, integrando TailwindCSS para la interfaz de usuario. |
| `package.json` | Gestión de dependencias, scripts del ciclo de vida del proyecto y metadatos. |
| `jsconfig.json` | Configuración de compilación de JavaScript y definición de alias de rutas (paths). |
| `AI_ROUTER.md` | Guía de direccionamiento y lógica para los agentes de inteligencia artificial del sistema. |
| `README.md` | Documentación inicial con instrucciones de configuración y visión general del proyecto. |
| `.env.example` | Plantilla de las variables de entorno requeridas para la conexión con servicios externos. |
| `.gitignore` | Definición de archivos y directorios excluidos del control de versiones. |

## Relaciones
- **Usa**: Next.js, TailwindCSS, ESLint, Supabase (vía migraciones y configuración).
- **Usado por**: Desarrolladores del ecosistema, procesos de despliegue y sub-agentes de IA.

## Detalles clave
- Estructura de la aplicación principal centrada en el directorio `src/` utilizando el App Router de Next.js.
- Integración de capacidades de IA especializadas mediante el directorio `.agents/`, con flujos de trabajo y habilidades personalizadas.
- Gestión de base de datos relacional mediante Supabase, con migraciones documentadas que definen la lógica de contenedores, costos y clientes.
- Documentación técnica exhaustiva organizada por fases (f1 a f10) dentro de la carpeta `docs/`.
- Soporte para importación de Packing Lists de Excel y cálculos volumétricos complejos.