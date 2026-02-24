Voy a generar el archivo `_CONTEXT.md` para el directorio `src/hooks/`, detallando la lógica de obtención de cotizaciones y el propósito de centralizar hooks personalizados.

# 🪝 src/hooks

## Propósito
Este directorio contiene los React Hooks personalizados de la aplicación, diseñados para encapsular lógica de estado reutilizable y efectos secundarios, promoviendo la separación de intereses entre la lógica de negocio y la interfaz de usuario.

## Archivos
| Archivo | Descripción |
|---|---|
| `useExchangeRate.js` | Gestiona la obtención y el estado (datos, carga y error) de las cotizaciones de divisas desde el endpoint de la API. |

## Relaciones
- **Usa**: React (Hooks básicos), API interna `/api/exchange-rate`.
- **Usado por**: `ExchangeRateSelector.js` y componentes de la calculadora de costos que requieren conversión de moneda.

## Detalles clave
- **Gestión de Asincronía**: Implementa un patrón estándar para el manejo de estados de carga (`loading`) y errores en peticiones `fetch`.
- **Centralización**: Asegura que la lógica de consulta a las tasas de cambio sea consistente en toda la aplicación, facilitando futuras implementaciones de caché o revalidación.
- **Client-side only**: El hook está marcado con la directiva `'use client'`, ya que depende del ciclo de vida de React y de APIs del navegador.