# 📁 src/app

## Propósito
Directorio raíz del App Router de Next.js. Contiene el diseño principal (layout), los estilos globales y la página de inicio que sirven como estructura base y punto de entrada para la aplicación de logística internacional.

## Archivos
| Archivo | Descripción |
|---|---|
| globals.css | Define estilos globales y variables CSS para el tema (claro/oscuro) integrando Tailwind CSS. |
| layout.js | Define el diseño principal (`RootLayout`) de la aplicación, configurando la estructura HTML base, metadatos y fuentes optimizadas (Geist). |
| page.js | Página de inicio (`Home`) de la aplicación, actualmente contiene la plantilla inicial por defecto de Next.js. |

## Relaciones
- **Usa**: `next/font/google` (fuentes Geist y Geist_Mono), `next/image` (componente Image) y `tailwindcss`.
- **Usado por**: Framework Next.js (como punto de entrada principal de la interfaz de usuario).

## Detalles clave
- Utiliza la arquitectura **App Router** de Next.js.
- Implementa **Tailwind CSS** con soporte para modo claro y oscuro a nivel global (`prefers-color-scheme`).
- Incluye optimización automática de fuentes e imágenes nativa de Next.js.
- El estado actual del código refleja el boilerplate de `create-next-app` y deberá ser reemplazado con la lógica de negocio y componentes específicos de logística internacional.