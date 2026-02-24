# 📂 src/lib

## Propósito
Este directorio actúa como la capa de utilidades y configuración central de la aplicación de logística. Agrupa las constantes globales de negocio, la lógica de cálculo, la configuración de la base de datos y las herramientas de procesamiento de archivos para ser consumidas por toda la plataforma.

## Archivos
| Archivo | Descripción |
|---|---|
| constants.js | Define constantes críticas del negocio, incluyendo estados de contenedores, orígenes de depósitos, dimensiones/pesos de tipos de contenedores y el mapa de navegación UI. |
| calculadora/ | Subdirectorio que encapsula la lógica para los motores de cálculo de costos y la calculadora volumétrica. |
| excel/ | Subdirectorio destinado a las utilidades de parseo y procesamiento de listas de empaque (packing lists) desde planillas de cálculo. |
| supabase/ | Subdirectorio con la instanciación de los clientes de base de datos (para servidor y cliente) mediante el SDK de Supabase. |

## Relaciones
- **Usa**: Librerías externas para la lectura de planillas de cálculo y el SDK de Supabase (específico dentro de sus subdirectorios correspondientes).
- **Usado por**: Componentes de interfaz de usuario (ej. Layout/Sidebar usando `NAV_ITEMS`), páginas de Next.js, Server Actions de contenedores, y la calculadora volumétrica consumiendo dimensiones exactas.

## Detalles clave
- Centraliza información física inmutable de los contenedores (largo, ancho, alto y peso máximo) en un solo lugar, previniendo discrepancias de cálculo en diferentes partes de la app.
- Gestiona de forma centralizada las clases de utilidad de Tailwind (`bg-yellow-100`, etc.) asociadas a los estados de los contenedores, facilitando cambios de diseño globales y evitando cadenas de texto mágicas en los componentes visuales.
- El patrón de separar la lógica compleja (cálculos, parseo de excel, infraestructura de base de datos) en subdirectorios específicos dentro de `lib` asegura que la capa de UI se mantenga limpia y enfocada solo en la presentación.