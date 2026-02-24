# 📦 src/app/contenedores/nuevo

## Propósito
Este directorio proporciona la interfaz de usuario para la creación de nuevos contenedores en el sistema. Contiene el formulario principal donde se ingresan los datos iniciales y de logística para registrar un contenedor.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de página de Next.js que renderiza el formulario de alta de contenedor, permitiendo definir su depósito de origen, tipo, fechas estimadas (ETD/ETA) y otros detalles. |

## Relaciones
- **Usa**: `@/lib/constants` (obtiene constantes de `WAREHOUSES` y `CONTAINER_TYPES`), `@/app/contenedores/actions` (consume la Server Action `createContainer`), `next/link`, `lucide-react`.
- **Usado por**: El enrutador de Next.js (App Router) como la ruta `/contenedores/nuevo`.

## Detalles clave
- Implementa Next.js Server Actions (vía `action={createContainer}`) para procesar el envío del formulario directamente en el servidor sin necesidad de llamadas fetch a una API.
- Los selectores del formulario (origen y tipo de contenedor) se alimentan de constantes globales, lo que asegura que las opciones estén estandarizadas en toda la aplicación.
- Requiere obligatoriamente que se seleccione el depósito de origen y el tipo de contenedor antes de permitir el envío del formulario.
- Presenta un diseño limpio usando Tailwind CSS e incluye controles para cancelar y volver fácilmente al listado de contenedores.