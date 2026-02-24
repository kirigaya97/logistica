# 📂 src/app/clientes

## Propósito
Este módulo centraliza la gestión de clientes de la plataforma, permitiendo administrar sus perfiles, configurar tarifas personalizadas (internacionales y locales) y visualizar métricas consolidadas de su carga.

## Archivos
| Archivo | Descripción |
|---|---|
| `actions.js` | Server Actions para operaciones CRUD de clientes, gestión de historial de tarifas y cálculo de estadísticas agregadas. |
| `page.js` | Vista principal que muestra el listado de clientes en formato de tarjetas con resumen de ubicación y tarifas vigentes. |

## Relaciones
- **Usa**: `src/lib/supabase/server.js` para persistencia, `zod` para validación de formularios y `lucide-react` para la interfaz visual.
- **Usado por**: Componentes de navegación global como el `Sidebar` y el sistema de asignación de clientes en los packing lists.

## Detalles clave
- **Historial de Tarifas**: Al actualizar un cliente, el sistema detecta cambios en las tarifas internacionales (USD) o locales (ARS) y registra automáticamente el valor previo y el nuevo en `client_rate_history`.
- **Cálculos en Tiempo Real**: La función `getClientWithHistory` realiza un cruce de datos para calcular el volumen total, peso total y cantidad de contenedores únicos asociados a un cliente específico.
- **Gestión de Etiquetas**: El sistema recupera y consolida las etiquetas (`tags`) de todos los ítems pertenecientes a un cliente para ofrecer una segmentación visual de su mercadería.
- **Integración con Supabase**: Utiliza políticas de seguridad a nivel de servidor y revalidación de rutas (`revalidatePath`) para asegurar que la interfaz refleje los cambios inmediatamente.