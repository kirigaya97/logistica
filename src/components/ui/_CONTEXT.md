# 🧭 src/components/ui

## Propósito
Contiene componentes de interfaz de usuario atómicos y reutilizables. Su objetivo es centralizar elementos visuales básicos que mantienen la consistencia estética y funcional en todo el sistema de logística.

## Archivos
| Archivo | Descripción |
|---|---|
| StatusBadge.js | Componente visual que muestra etiquetas de estado coloreadas basadas en la situación actual de los contenedores. |

## Relaciones
- **Usa**: `@/lib/constants` (para obtener las etiquetas y colores de `CONTAINER_STATES`).
- **Usado por**: `src/components/contenedores/ContainerCard.js` y componentes de visualización de tablas o detalles de contenedores.

## Detalles clave
- **Dependencia de Constantes**: El componente no define estilos propios para los estados, sino que los mapea dinámicamente desde la configuración centralizada en `constants.js`.
- **Manejo de Errores**: Implementa una validación que evita el renderizado (retorna `null`) si el código de estado proporcionado no existe en el catálogo.
- **Estilo**: Utiliza clases utilitarias de Tailwind CSS para definir bordes redondeados y tipografía pequeña, siguiendo el patrón de diseño de badges/pills.