# 📂 src/app/calculadora-costos/config

## Propósito
Módulo dedicado a la gestión y configuración de plantillas de costos internacionales. Permite definir perfiles de gastos predeterminados (items, valores y tipos) que se aplican automáticamente a nuevos contenedores o simulaciones.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Página de servidor que coordina la carga de plantillas existentes y el detalle de los items de la plantilla activa para su edición. |

## Relaciones
- **Usa**: `src/app/calculadora-costos/actions.js` (Server Actions), `src/components/calculadora/TemplateManager.js` (Componente de UI), `lucide-react` (Iconografía), `next/link`.
- **Usado por**: Vinculado desde el simulador principal (`/calculadora-costos`) para permitir ajustes en la estructura de costos base.

## Detalles clave
- **Gestión de Plantillas**: Soporta una "Plantilla Base" (global y protegida contra eliminación) y múltiples plantillas personalizadas creadas por el usuario.
- **Navegación por Slug**: Utiliza el parámetro de búsqueda `slug` en la URL para determinar qué perfil de costos se visualiza y edita en el `TemplateManager`.
- **Integración de Componentes**: Delega la lógica de edición masiva al componente `CostMatrix`, permitiendo previsualizar el impacto de los cambios en una estructura de costos simulada.
- **Flujo de Trabajo**: Los cambios realizados se impactan directamente en la base de datos a través de acciones de servidor, asegurando la consistencia en futuros cálculos.