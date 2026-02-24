Voy a generar el archivo `_CONTEXT.md` para el directorio `src/app/clientes/nuevo/` basándome en el código proporcionado de `page.js`.

# 📂 src/app/clientes/nuevo

## Propósito
Proporciona la interfaz y la lógica de entrada para la creación de nuevos clientes en el sistema, sirviendo como el punto de acceso a la ruta `/clientes/nuevo`.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de página que estructura la vista de alta de cliente, integrando el formulario con la acción de creación. |

## Relaciones
- **Usa**: `@/app/clientes/actions` (para la persistencia de datos), `@/components/clientes/ClientForm` (componente visual del formulario), `next/link` y `lucide-react`.
- **Usado por**: Navegación principal del módulo de clientes y accesos directos de creación.

## Detalles clave
- Implementa un patrón de desacoplamiento al inyectar la acción `createClientAction` como prop al componente `ClientForm`.
- Proporciona una navegación clara de retorno hacia el listado general de clientes mediante un enlace con icono.
- Mantiene un diseño simplificado y centrado (max-w-2xl) para facilitar la carga de datos del usuario.

## Notas manuales
*(No se detectaron secciones manuales previas en la entrada, pero se reserva este espacio para futuras observaciones de implementación)*