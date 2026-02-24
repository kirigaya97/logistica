# 🧭 AI Router — Logística Internacional

> Punto de entrada para agentes IA. Leé este archivo primero.  
> Auto-generado por `scripts/map-context.mjs`  
> Última actualización: 2026-02-24

## Proyecto
Sistema de gestión de logística internacional con 3 depósitos (HK, CH, USA). Seguimiento de contenedores, clasificación de mercadería, cálculo de costos de importación, dashboards operativos.

## Stack
Next.js 14 (App Router) · Supabase (PostgreSQL) · Vercel · Tailwind CSS

## Convenciones
- Componentes: PascalCase (ContainerForm.js)
- Libs/utils: camelCase (exchangeRate.js)
- Tablas DB: snake_case (packing_list_items)
- Rutas URL: kebab-case (/calculadora-volumetrica)
- Server Components por defecto, "use client" solo para interactividad
- Validación: Zod en server actions
- UI en español · Monedas: USD y ARS

## Mapa del Proyecto

| Directorio | Archivos | Contexto |
|---|---|---|
| `src/app/` | 3 | [→ _CONTEXT.md](src/app/_CONTEXT.md) |
| `./` | 3 | [→ _CONTEXT.md](./_CONTEXT.md) |

## Documentación
- [Relevamiento funcional](docs/relevamiento_funcional.md) (si existe)
- [Arquitectura](docs/arquitectura.md) (si existe)
- [Plan de implementación](docs/implementation_plan.md) (si existe)

## Cómo Navegar (para agentes)
1. Leé este archivo para entender el proyecto
2. Identificá qué directorio(s) son relevantes para tu tarea
3. Leé el `_CONTEXT.md` de esos directorios  
4. Leé SOLO los archivos específicos que necesitás
5. Ejecutá la tarea con contexto mínimo y preciso
