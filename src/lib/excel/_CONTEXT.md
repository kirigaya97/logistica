# 📁 src/lib/excel

## Propósito
Este directorio centraliza la lógica de procesamiento de archivos Excel, facilitando la extracción de datos y el mapeo inteligente de columnas para la importación de packing lists y otros documentos logísticos.

## Archivos
| Archivo | Descripción |
|---|---|
| parser.js | Procesa archivos .xlsx/xls para extraer filas de datos y realizar una detección automática de encabezados mediante patrones de texto. |

## Relaciones
- **Usa**: `xlsx` (biblioteca externa para parsing de hojas de cálculo).
- **Usado por**: `src/components/packing-list/PackingListImporter.js`.

## Detalles clave
- **Detección Automática**: Utiliza el objeto `FIELD_PATTERNS` para normalizar y buscar palabras clave (ej: "qty", "cant", "peso", "kg") en los encabezados del Excel.
- **Validación de Estructura**: El parser exige un mínimo de un encabezado y una fila de datos, rechazando archivos que no cumplan este criterio.
- **Limpieza de Datos**: Implementa un filtrado de filas vacías (donde todas las celdas sean null o undefined) antes de entregar los resultados.
- **Normalización**: Las comparaciones de encabezados se realizan convirtiendo el texto a minúsculas y eliminando caracteres no alfanuméricos para mejorar la coincidencia.