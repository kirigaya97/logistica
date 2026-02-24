# 📁 src/lib

## Propósito
Este directorio centraliza la lógica de negocio, integraciones de terceros y constantes fundamentales de la aplicación de logística. Actúa como el núcleo de utilidades y configuraciones compartidas, aislando las reglas del dominio logístico y la gestión de datos de los componentes de la interfaz de usuario.

## Archivos
| Archivo | Descripción |
|---|---|
| `constants.js` | Define las constantes globales y configuraciones estáticas del dominio, incluyendo estados de operación, orígenes (depósitos), especificaciones físicas de contenedores y la estructura de navegación de la aplicación. |
| `calculadora/` | Subdirectorio que encapsula el motor de cálculo de costos logísticos y la lógica matemática para el cálculo de cubicaje volumétrico. |
| `excel/` | Subdirectorio encargado del parseo y la extracción de datos de archivos Excel, fundamental para la importación de Packing Lists. |
| `supabase/` | Subdirectorio que contiene la configuración y los clientes de conexión (tanto para el cliente como para el servidor) de la base de datos Supabase. |
| `utils/` | Subdirectorio destinado a funciones de utilidad compartidas, como los scripts para exportar información y reportes. |

## Relaciones
- **Usa**: Dependencias nativas y librerías de terceros gestionadas en los subdirectorios (ej. SDK de Supabase, librerías de manipulación de Excel).
- **Usado por**: Prácticamente toda la aplicación. Los componentes de UI (layout, tarjetas, formularios), páginas de rutas (App Router), y Server Actions consumen sus constantes, clientes de base de datos y motores de cálculo.

## Detalles clave
- **Estandarización del Dominio**: `constants.js` provee la fuente de la verdad para el ciclo de vida de un contenedor (depósito, tránsito, aduana, finalizado) y sus etiquetas visuales asociadas.
- **Límites Físicos**: Las dimensiones (largo, ancho, alto) y los pesos máximos por tipo de contenedor (20', 40', 40' HC) están definidos estáticamente y son la base indispensable para el módulo de `calculadora-volumetrica`.
- **Navegación Centralizada**: Los grupos y rutas del menú principal (`NAV_GROUPS`) se inyectan desde las constantes, lo que permite modificar la estructura del dashboard sin tocar los componentes visuales.
- **Modularidad**: La lógica está estrictamente segmentada por dominio de responsabilidad (cálculos, persistencia de datos con Supabase, manejo de archivos Excel y utilidades generales) facilitando el mantenimiento y la escalabilidad.