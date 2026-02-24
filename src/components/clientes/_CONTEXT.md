# 📁 src/components/clientes

## Propósito
Este directorio contiene los componentes de interfaz de usuario específicos para la gestión y visualización de la información de los clientes, abarcando desde la entrada de datos hasta la visualización analítica de su actividad.

## Archivos
| Archivo | Descripción |
|---|---|
| `ClientForm.js` | Formulario reutilizable para la creación o edición de clientes, permitiendo ingresar nombre, ubicación, tarifas (local e internacional) y notas. |
| `ClientSummary.js` | Componente de presentación que muestra estadísticas generales del cliente, agrupa y calcula totales de sus contenedores, y exhibe un historial visual de modificaciones de tarifas. |

## Relaciones
- **Usa**: `next/link`, componentes de interfaz (`@/components/ui/StatusBadge`), constantes de negocio (`@/lib/constants`) e iconografía (`lucide-react`).
- **Usado por**: Vistas de páginas dentro de `src/app/clientes/` (ej. páginas de detalle, creación y edición de clientes).

## Detalles clave
- **Agrupación en memoria**: `ClientSummary` procesa la lista de items del cliente para agruparlos por contenedor y calcular dinámicamente el volumen, peso y cantidad total en el cliente.
- **Historial visual**: Presenta un registro de cambios de tarifas mostrando visualmente la tendencia (alza o baja) mediante iconos.
- **Integración con Server Actions**: `ClientForm` está preparado para recibir una Server Action a través de la prop `action` para el procesamiento nativo del formulario en Next.js.
- **Reusabilidad**: El formulario soporta valores por defecto a través de la prop `client`, permitiendo que el mismo componente funcione tanto para altas como para modificaciones.