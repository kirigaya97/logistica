# 📦 src/app/contenedores/nuevo

## Propósito
Interfaz de usuario para la creación y registro de nuevos contenedores en el sistema. Facilita la carga de datos logísticos iniciales, como el depósito de origen, especificaciones técnicas y cronograma estimado.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Componente de página que renderiza el formulario de alta y gestiona la interacción del usuario para la creación de contenedores. |

## Relaciones
- **Usa**:
    - `@/lib/constants.js`: Para obtener las listas maestras de depósitos, tipos de contenedores y capacidades de peso permitidas.
    - `@/app/contenedores/actions.js`: Consume la Server Action `createContainer` para procesar y persistir los datos.
    - `next/link`: Para la navegación de retorno hacia el listado general.
    - `lucide-react`: Para la iconografía de la interfaz.
- **Usado por**: Módulo principal de contenedores (`/contenedores`) como punto de entrada para nuevos registros.

## Detalles clave
- **Acciones de Servidor**: Implementa el envío de datos mediante Server Actions, lo que permite un manejo simplificado del estado del formulario y redirecciones automáticas tras el éxito.
- **Generación de Identificadores**: El proceso de creación dispara una lógica de generación de códigos automáticos con formato `[ORIGEN]-[AÑO]-[SECUENCIA]` (ej. HK-2026-001).
- **Validación de Datos**: La integridad de la información está garantizada por un esquema de Zod en el lado del servidor que valida tipos de depósito, contenedores y rangos de peso.
- **Campos Logísticos**: Permite la definición opcional de fechas críticas como ETD (salida estimada) y ETA (arribo estimado) desde el momento del alta.