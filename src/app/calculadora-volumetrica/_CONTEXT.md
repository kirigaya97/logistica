# 📁 src/app/calculadora-volumetrica

## Propósito
Este directorio contiene la página de la Calculadora Volumétrica de la aplicación. Su objetivo es proporcionar una interfaz para que los usuarios puedan calcular cuántas cajas de un tamaño específico caben dentro de un contenedor de carga.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de página de Next.js que renderiza la vista principal de la herramienta e instancia el componente interactivo de la calculadora. |

## Relaciones
- **Usa**: `@/components/calculadora/VolumetricCalc`
- **Usado por**: Next.js App Router (Sistema de enrutamiento principal, accesible vía `/calculadora-volumetrica`).

## Detalles clave
- Sirve como un contenedor de presentación estructurado para la herramienta de cálculo volumétrico.
- Delega la interactividad y la lógica de cálculo principal al componente importado `VolumetricCalc`.
- Utiliza clases de Tailwind CSS (`max-w-3xl`, `text-2xl`, `text-gray-500`) para el diseño responsivo y el estilo de la cabecera.