# 📁 src/app/contenedores/nuevo

## Propósito
Este módulo proporciona la interfaz y la lógica necesaria para dar de alta un nuevo contenedor en el sistema, permitiendo definir su origen, tipo y cronograma estimado de viaje.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Componente de página que renderiza el formulario de creación de contenedor con validaciones básicas y navegación. |

## Relaciones
- **Usa**: 
    - `@/lib/constants` (para obtener los depósitos y tipos de contenedores permitidos).
    - `@/app/contenedores/actions` (ejecuta la Server Action `createContainer`).
    - `lucide-react` (iconografía de interfaz).
    - `next/link` (navegación hacia el listado de contenedores).
- **Usado por**: Por determinar (generalmente vinculado desde el dashboard o el listado principal de contenedores).

## Detalles clave
- **Lógica de Servidor**: El formulario utiliza la acción `createContainer` que valida los datos mediante un esquema de Zod antes de persistirlos en Supabase.
- **Identificación Automática**: El sistema genera automáticamente un código único para el contenedor siguiendo el patrón `{ORIGEN}-{AÑO}-{SECUENCIA}` (ej: HK-2024-001).
- **Integración de Constantes**: Los selectores de "Depósito de Origen" y "Tipo de Contenedor" se alimentan directamente de las definiciones globales en `constants.js`, asegurando consistencia en los datos.
- **Flujo de Usuario**: Tras una creación exitosa, el sistema realiza una revalidación de caché de la ruta `/contenedores` y redirige al usuario al listado principal.
- **Fechas Logísticas**: Permite la carga de ETD (salida estimada) y ETA (arribo estimado) para el seguimiento temprano del transporte.