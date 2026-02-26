# 📂 src/lib

## Propósito
Centraliza las constantes globales, la lógica de negocio core y los clientes de servicios externos utilizados en toda la plataforma de logística, actuando como la capa de servicios y configuración del proyecto.

## Archivos
| Archivo | Descripción |
|---|---|
| constants.js | Definiciones estáticas de estados de contenedores, tipos de unidades, depósitos internacionales y configuración de la navegación principal. |

## Relaciones
- **Usa**: Librerías de terceros (Supabase, SheetJS, ExcelJS) integradas a través de sus respectivos subdirectorios.
- **Usado por**: Componentes de la interfaz, Server Actions en `src/app` y hooks personalizados para mantener la consistencia de datos en toda la aplicación.

## Detalles clave
- **Ciclo de Vida**: `CONTAINER_STATES` define el flujo operativo (Depósito -> Tránsito -> Aduana -> Finalizado) y centraliza los estilos visuales de los badges.
- **Estandarización**: Provee dimensiones físicas exactas (largo, ancho, alto) para contenedores 40HC y 40ST, fundamentales para los motores de cálculo.
- **Arquitectura Modular**: Organiza la lógica compleja en subdirectorios especializados: `calculadora` para el motor de costos, `excel` para parsing de datos, y `supabase` para la persistencia.
- **Navegación Centralizada**: El objeto `NAV_GROUPS` facilita la gestión de permisos y la estructura del menú lateral desde un único punto.