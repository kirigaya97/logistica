# 🛠️ src/lib/utils

## Propósito
Provee funciones de utilidad transversales para el procesamiento de datos y la generación de archivos descargables, facilitando la exportación de información logística a formatos legibles por el usuario final.

## Archivos
| Archivo | Descripción |
|---|---|
| `excelExport.js` | Motor de generación de reportes Excel (.xlsx) que transforma datos de contenedores, packing lists y costos en documentos con formato profesional. |

## Relaciones
- **Usa**: `exceljs`, `@/lib/calculadora/defaults`, `@/lib/constants`.
- **Usado por**: Componentes de exportación en vistas de contenedores, packing lists, simulaciones de costos y el componente genérico `ExportButton`.

## Detalles clave
- **Consistencia Visual**: Centraliza el estilo de las planillas (colores de cabecera, filas alternas, bordes y filtros automáticos) mediante el helper `applySheetStyling`.
- **Mapeo de Datos**: Transforma códigos internos de depósitos (HK, CH, USA) y estados de contenedores a etiquetas legibles para el usuario.
- **Cálculos Automáticos**: Genera filas de totales para cantidades, pesos y volúmenes directamente durante la construcción del archivo.
- **Soporte Multi-hoja**: Permite exportaciones complejas (tipo `container_full`) que consolidan información general, ítems y matrices de costos en un solo libro de trabajo.
- **Formateo de Celdas**: Implementa funciones específicas para el formato de moneda y alineación de valores numéricos para asegurar la precisión visual de los datos financieros.