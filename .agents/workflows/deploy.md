---
description: Cómo desplegar la aplicación a producción
---

# Deploy a Vercel

// turbo-all
1. Verificar build local: `npm run build`
2. Verificar que no hay errores de lint: `npm run lint`
3. Commit y push: `git add . && git commit -m "descripción" && git push origin main`
4. Vercel despliega automáticamente desde el branch `main`

## Variables de entorno necesarias en Vercel
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key de Supabase
