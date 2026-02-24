---
description: Cómo crear un nuevo módulo en el sistema
---

# Crear Nuevo Módulo

Pasos para agregar un nuevo módulo al sistema de logística:

1. Leer `AI_ROUTER.md` para entender la estructura actual
2. Crear migración SQL en `supabase/migrations/NNN_nombre.sql` si requiere tablas nuevas
3. Crear página en `src/app/[modulo]/page.js` (App Router)
4. Crear componentes en `src/components/[modulo]/`
5. Crear lógica de negocio en `src/lib/[modulo]/` si es necesario
6. Agregar hooks en `src/hooks/` si se necesita estado reactivo
7. Agregar entrada en la navegación (`src/components/layout/Sidebar.js`)

// turbo
8. Verificar con `npm run dev` que todo compila y renderiza correctamente

## Convenciones de naming
- Páginas: `page.js` (Next.js App Router convention)
- Componentes: PascalCase (`ContainerForm.js`)
- Libs: camelCase (`costEngine.js`)
- DB tables: snake_case (`packing_list_items`)
- URLs: kebab-case (`/calculadora-volumetrica`)
