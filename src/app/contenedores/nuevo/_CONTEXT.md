# 📁 src/app/contenedores/nuevo

## Propósito
Este directorio contiene la página y el formulario para registrar un nuevo contenedor en el sistema, permitiendo especificar su origen, tipo, fechas estimadas y detalles adicionales.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Interfaz de usuario con el formulario de creación de contenedor. Utiliza Next.js Server Actions para el procesamiento y envío de datos. |

## Relaciones
- **Usa**: `@/lib/constants` (para las opciones de depósitos y tipos de contenedores), `@/app/contenedores/actions` (Server Action `createContainer` para guardar el registro), `next/link` (para navegación) y `lucide-react` (iconografía).
- **Usado por**: Navegación de la sección de contenedores (accesible desde `/contenedores`).

## Detalles clave
- Implementa un formulario que se integra directamente con Server Actions de Next.js mediante el atributo `action={createContainer}`.
- Los campos "Depósito de Origen" y "Tipo de Contenedor" son obligatorios y sus opciones se generan dinámicamente a partir de constantes de la aplicación (`WAREHOUSES`, `CONTAINER_TYPES`).
- Contempla el registro de fechas clave para logística internacional: ETD (Estimated Time of Departure) y ETA (Estimated Time of Arrival).
- Incluye flujos de cancelación y retorno hacia la lista principal de contenedores para mejorar la experiencia de usuario.