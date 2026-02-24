# Logística Internacional

Sistema de gestión de logística internacional con 3 depósitos (Hong Kong, China, USA).

## Stack
- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Regenerar contexto JIT
npm run map:full
```

## JIT Context Assembly

Este proyecto usa un sistema de **Just-In-Time Context Assembly** para desarrollo asistido por IA:

- `AI_ROUTER.md` — Punto de entrada para agentes IA
- `_CONTEXT.md` — Contexto local por directorio
- `scripts/map-context.mjs` — Mapper que genera los contextos

El mapper se ejecuta automáticamente en cada commit (via Husky pre-commit hook).
