# 📁 src/lib

## Propósito
Este directorio contiene librerías, utilidades compartidas, constantes de negocio y la configuración de servicios de terceros para la aplicación de logística internacional. Centraliza datos estáticos y conexiones a bases de datos para mantener consistencia en todo el proyecto.

## Archivos
| Archivo | Descripción |
|---|---|
| `constants.js` | Define constantes globales del dominio logístico, incluyendo estados, depósitos, dimensiones/pesos de tipos de contenedores y los elementos de navegación de la UI. |
| `supabase/client.js` | Configuración y cliente de Supabase para ser utilizado en el lado del navegador (Client Components). |
| `supabase/server.js` | Configuración y cliente de Supabase optimizado para operaciones en el lado del servidor (Server Components/Actions). |

## Relaciones
- **Usa**: SDK de Supabase para la conexión a la base de datos y autenticación.
- **Usado por**: Componentes de layout (Sidebar, Header), páginas de la aplicación (Calculadora Volumétrica, Contenedores, Dashboard) y funciones de servidor.

## Detalles clave
- **Lógica Volumétrica**: `constants.js` almacena las dimensiones exactas (cm) y peso máximo (kg) de los contenedores (20', 40', 40' HC), información vital para los cálculos de la calculadora volumétrica.
- **Estados Estandarizados**: Define un flujo claro de estados para la carga (En Depósito, En Tránsito, En Aduana, Finalizado) con colores asociados para la UI.
- **Arquitectura de Base de Datos**: Divide claramente los clientes de Supabase (`client.js` y `server.js`) para respetar el paradigma de App Router en Next.js.
- **Mantenibilidad UI**: Centraliza los ítems de navegación y la información estática de los depósitos (HK, CH, USA) para facilitar cambios globales.