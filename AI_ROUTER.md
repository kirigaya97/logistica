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
| `src/app/api/exchange-rate/` | 1 | [→ _CONTEXT.md](src/app/api/exchange-rate/_CONTEXT.md) |
| `src/app/calculadora-costos/config/` | 1 | [→ _CONTEXT.md](src/app/calculadora-costos/config/_CONTEXT.md) |
| `src/app/calculadora-costos/[id]/` | 1 | [→ _CONTEXT.md](src/app/calculadora-costos/[id]/_CONTEXT.md) |
| `src/app/calculadora-costos/` | 2 | [→ _CONTEXT.md](src/app/calculadora-costos/_CONTEXT.md) |
| `src/app/calculadora-volumetrica/` | 1 | [→ _CONTEXT.md](src/app/calculadora-volumetrica/_CONTEXT.md) |
| `src/app/clientes/nuevo/` | 1 | [→ _CONTEXT.md](src/app/clientes/nuevo/_CONTEXT.md) |
| `src/app/clientes/[id]/` | 1 | [→ _CONTEXT.md](src/app/clientes/[id]/_CONTEXT.md) |
| `src/app/clientes/` | 2 | [→ _CONTEXT.md](src/app/clientes/_CONTEXT.md) |
| `src/app/contenedores/nuevo/` | 1 | [→ _CONTEXT.md](src/app/contenedores/nuevo/_CONTEXT.md) |
| `src/app/contenedores/[id]/costos/` | 2 | [→ _CONTEXT.md](src/app/contenedores/[id]/costos/_CONTEXT.md) |
| `src/app/contenedores/[id]/packing-list/` | 2 | [→ _CONTEXT.md](src/app/contenedores/[id]/packing-list/_CONTEXT.md) |
| `src/app/contenedores/[id]/` | 1 | [→ _CONTEXT.md](src/app/contenedores/[id]/_CONTEXT.md) |
| `src/app/contenedores/` | 2 | [→ _CONTEXT.md](src/app/contenedores/_CONTEXT.md) |
| `src/app/etiquetas/` | 2 | [→ _CONTEXT.md](src/app/etiquetas/_CONTEXT.md) |
| `src/app/historico/` | 1 | [→ _CONTEXT.md](src/app/historico/_CONTEXT.md) |
| `src/app/login/` | 1 | [→ _CONTEXT.md](src/app/login/_CONTEXT.md) |
| `src/app/` | 3 | [→ _CONTEXT.md](src/app/_CONTEXT.md) |
| `src/components/calculadora/` | 5 | [→ _CONTEXT.md](src/components/calculadora/_CONTEXT.md) |
| `src/components/clientes/` | 2 | [→ _CONTEXT.md](src/components/clientes/_CONTEXT.md) |
| `src/components/contenedores/` | 5 | [→ _CONTEXT.md](src/components/contenedores/_CONTEXT.md) |
| `src/components/layout/` | 3 | [→ _CONTEXT.md](src/components/layout/_CONTEXT.md) |
| `src/components/packing-list/` | 4 | [→ _CONTEXT.md](src/components/packing-list/_CONTEXT.md) |
| `src/components/ui/` | 4 | [→ _CONTEXT.md](src/components/ui/_CONTEXT.md) |
| `src/hooks/` | 1 | [→ _CONTEXT.md](src/hooks/_CONTEXT.md) |
| `src/lib/calculadora/` | 3 | [→ _CONTEXT.md](src/lib/calculadora/_CONTEXT.md) |
| `src/lib/excel/` | 1 | [→ _CONTEXT.md](src/lib/excel/_CONTEXT.md) |
| `src/lib/supabase/` | 2 | [→ _CONTEXT.md](src/lib/supabase/_CONTEXT.md) |
| `src/lib/utils/` | 1 | [→ _CONTEXT.md](src/lib/utils/_CONTEXT.md) |
| `src/lib/` | 1 | [→ _CONTEXT.md](src/lib/_CONTEXT.md) |
| `src/` | 1 | [→ _CONTEXT.md](src/_CONTEXT.md) |
| `supabase/migrations/` | 8 | [→ _CONTEXT.md](supabase/migrations/_CONTEXT.md) |
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
