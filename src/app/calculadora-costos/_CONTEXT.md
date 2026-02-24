# 📂 src/app/calculadora-costos

## Propósito
Este módulo proporciona la interfaz y la lógica del lado del servidor para realizar y gestionar simulaciones de costos de importación de forma independiente a un contenedor específico. Permite a los usuarios crear, visualizar y eliminar simulaciones, además de gestionar una plantilla de costos predeterminada.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Define las Server Actions encargadas de la persistencia de datos en Supabase (guardar, obtener y eliminar simulaciones en `cost_simulations`, y gestionar la plantilla base en `cost_template_config`). |
| `page.js` | Página principal que obtiene las simulaciones históricas y la plantilla por defecto desde el servidor para luego renderizar la interfaz a través del componente `Simulator`. |
| `config/` | Subdirectorio que contiene la página dedicada a la configuración de la plantilla de costos por defecto. |

## Relaciones
- **Usa**: `@/lib/supabase/server` (cliente de base de datos), `next/cache` (revalidación de rutas), `@/components/calculadora/Simulator` (componente visual principal), `@/lib/calculadora/defaults` (valores constantes predeterminados) y `lucide-react` (iconografía).
- **Usado por**: Actúa como ruta de página en el App Router de Next.js, siendo accesible directamente por la navegación del usuario.

## Detalles clave
- Utiliza el patrón de Server Actions (`'use server'`) para mantener la lógica de base de datos segura y separada del cliente.
- Las simulaciones de costos almacenan la estructura de los ítems en formato `JSONB`, lo que da flexibilidad a los elementos que componen la simulación.
- Incorpora un sistema de plantillas por defecto (`is_default: true` en `cost_template_config`) que impacta tanto en las nuevas simulaciones como en los cálculos de los contenedores a nivel general.
- Emplea `revalidatePath` para actualizar la memoria caché de las rutas `/calculadora-costos`, `/calculadora-costos/config` y `/contenedores` tras cualquier mutación, asegurando que la UI siempre muestre datos frescos.