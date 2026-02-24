# 📂 src/app/contenedores/[id]

## Propósito
Gestiona la visualización detallada, edición y el control del ciclo de vida de un contenedor específico, centralizando la información de carga, clientes involucrados y el acceso a módulos de costos y packing list.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de servidor que renderiza la ficha técnica del contenedor, maneja el modo edición mediante parámetros de URL y coordina las transiciones de estado. |

## Relaciones
- **Usa**: `@src/lib/supabase/server.js`, `@src/app/contenedores/actions.js`, `@src/lib/constants.js`, `@src/components/ui/StatusBadge.js`, `@src/components/contenedores/ContainerEditForm.js`, `@src/components/contenedores/DeleteContainerButton.js`, `@src/components/contenedores/RevertStatusButton.js`, `@src/components/ui/ExportButton.js`.
- **Usado por**: Módulo principal de contenedores y sistema de navegación global.

## Detalles clave
- **Máquina de Estados**: Implementa un flujo lineal de estados (`deposito` -> `transito` -> `aduana` -> `finalizado`) permitiendo avanzar o revertir etapas según el progreso logístico.
- **Edición Dinámica**: Utiliza el parámetro de búsqueda `?edit=true` para alternar entre la vista de detalles y el formulario de edición sin recargar la página.
- **Inteligencia de Carga**: Realiza una agregación en tiempo real de los "Clientes a bordo", calculando el volumen total ocupado (m³) y la cantidad de bultos por cada cliente asignado al contenedor.
- **Exportación Full**: Integra una función de exportación que consolida en un solo archivo Excel los datos del contenedor, la lista de empaque completa y el desglose de ítems de costos.
- **Navegación Contextual**: Actúa como panel de control central con accesos directos protegidos por contexto hacia las sub-rutas de costos y packing list.

## Subdirectorios
- `costos/`: Gestión detallada de ítems de costo y cálculos financieros del contenedor.
- `packing-list/`: Importación, clasificación y visualización de la mercadería transportada.