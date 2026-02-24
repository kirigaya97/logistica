Generaré el archivo `_CONTEXT.md` para el endpoint de tipos de cambio siguiendo el formato solicitado.

# 🌐 src/app/api/exchange-rate

## Propósito
Proporciona un endpoint interno para la obtención de tipos de cambio actualizados del dólar, actuando como un proxy hacia un servicio externo y gestionando una capa de caché local.

## Archivos
| Archivo | Descripción |
|---|---|
| `route.js` | Implementa el manejador GET que consulta la API externa y retorna los datos en formato JSON. |

## Relaciones
- **Usa**: API externa DolarAPI (`https://dolarapi.com`).
- **Usado por**: `src/hooks/useExchangeRate.js` y componentes de la calculadora que requieren conversiones de moneda en tiempo real.

## Detalles clave
- **Estrategia de Caché**: Implementa `next: { revalidate: 300 }` para refrescar los datos cada 5 minutos, optimizando el consumo de la API externa.
- **Normalización**: Sirve como punto centralizado para asegurar que toda la aplicación utilice la misma fuente de datos para el cálculo de costos logísticos.
- **Resiliencia**: Incluye un bloque try/catch para manejar fallos en la red o en el servicio externo, devolviendo un error 500 estandarizado.